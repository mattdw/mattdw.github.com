"use strict";
$(function () {
  
  function Creature (length) {
    if (!(this instanceof Creature)) {
      console.log("You forgot a new in Creature");
      return new Creature();
    }

    this.genes = _.map(_.range(length), _.bind(this.newGene, this));
    this.generation = 0;
    this.age = 0;
    this._fitness = null;
    
    return this;
  }
  
  Creature.prototype.toString = function () {
    return "Creature <g" + this.generation + "/a" + this.age + "> " +
      "[" + this.genes + "]";
  };
  
  
  Creature.prototype.mutations = [
    // insert a gene at random index
    function (genes) {
      var i = Math.floor(Math.random() * (genes.length + 1));
      genes.splice(i, 0, this.newGene());
      return genes;
    },
    // remove a gene at random index
    function (genes) {
      var i = Math.floor(Math.random() * genes.length);
      genes.splice(i, 1);
      return genes;
    },
    // change a gene at random index
    function (genes) {
      var i = Math.floor(Math.random() * genes.length);
      genes.splice(i, 1, this.mutateGene(genes[i]));
      return genes;
    }
  ];

  Creature.prototype.mutate = function () {
    this._fitness = null;
    var r = Math.floor(Math.random() * this.mutations.length);
    this.genes = _.bind(this.mutations[r], this)(this.genes);
    return this;
  };

  // should be overridden
  Creature.prototype.mutateGene = function (gene) {
    // code here
    return gene + _.first(_.shuffle([0, 1, -1]));
  };
  
  // should be overridden
  Creature.prototype.newGene = function () {
    return _.first(_.shuffle([0, 1, -1]));
  };
  
  // A lower fitness is better, because this makes sorting easier.
  // fitness should be overridden.
  Creature.prototype.fitness = function (env) {
    if (this._fitness) {
      return this._fitness;
    }
    return this._fitness = 1;
  };

  Creature.prototype.breedWith = function (other) {
    var child = _.clone(this);
    var geneChoices = _.zip(child.genes, other.genes);
    var newGenes = _.filter(_.map(geneChoices,
                                  function (c) {
                                    return c[Math.floor(Math.random() * 2)];
                                  }),
                           function (x) { return !!x;});
    child.genes = newGenes;
    child.mutate();
    child.age = 0;
    child.generation = Math.max(this.generation, other.generation) + 1;
    return child;
  };

  // A Population controls a collection of Creatures over time,
  // culling the unfit ones and refilling the population with
  // cross-breeds of the fit ones.
  function Population (env, creatureCtor, size, opts) {
    this.creatureCtor = creatureCtor;
    this.members = _.map(_.range(size), creatureCtor);
    this.size = size;
    this.options = opts || {};
    this.env = env || {};
    this.generation = 0;
  }

  Population.prototype.cull = function (keep) {
    if (!keep) {
      keep = Math.floor(this.size / 3);
    }
    
    if (typeof this.options.maxAge != "undefined" && this.options.maxAge) {
      var maxAge = this.options.maxAge;
      this.members = _.reject(this.members, function (m) {return m.age >= maxAge;});
    }
    this.members = _.map(this.members, function (m) {m.age++; return m;});

    this.members = _.first(this.members, keep);
    
    return this;
  };
  
  Population.prototype.regenerate = function () {
    var needed = this.size - this.members.length;

    var members = this.members;
    var newMembers = [];
    for (var i = 0; i < needed; i++) {
      (function () {
        var cs = _.shuffle(members);
        var m1 = cs[0];
        var m2 = cs[1];
        newMembers.push(m1.breedWith(m2));
      })();
    }

    this.members = this.members.concat(newMembers);
    // lower fitness is better
    var env = this.env;
    this.members = _.sortBy(this.members, 
                            function (m) {return m.fitness(env);});
    this.generation++;
    return this;
  };
  


  // A Word is a Creature. Genes are letters, and the objective is to
  // match a word or phrase.
  function Word (length) {
    this.genes = _.map(_.range(length), _.bind(this.newGene, this));
    return this;
  }
  Word.prototype = new Creature();
  
  Word.prototype.fitness = function (env) {
    if (this._fitness) return this._fitness;
    var score = 0;
    score += Math.abs((this.genes.length - env.word.length) * 10);
    var pairDiffs = _.map(_.zip(this.genes, env.word),
                          function (pair) {return Math.abs(
                            ((pair[0] || "").charCodeAt(0) || 0) - 
                              ((pair[1] || "").charCodeAt(0) || 0));
                                  });
    return this._fitness = _.reduce(pairDiffs, function (a, b) {return a + b;}, score);
  };
  
  Word.prototype.newGene = function () {
    return String.fromCharCode(Math.floor(Math.random() * 255));
  };
  
  Word.prototype.mutateGene = function (gene) {
    var c = gene.charCodeAt(0);
    c += _.first(_.shuffle([1, -1, 2, -2]));
    if (c < 0) {
      c = 255;
    } else if (c > 255) {
      c = 0;
    }
    return String.fromCharCode(c);
  };

  Word.prototype.toString = function () {
    return "Word \"" + this.genes.join("") + "\"";
  };

  Word.prototype.render = function () {
    return "<span style=\"color: hsl(0,0%," + this.age * 5 + "%);\">" +
      this.genes.join("") + "</span>";
  };
  
  
  window.Creature = Creature;
  window.Word = Word;
  window.Population = Population;

  var jobController = $({});
  
  function iteratePopulation(controller) {
    if (!controller.running) return;
    
    controller.population.cull();
    controller.population.regenerate();
    controller.trigger("render");
    
    if (controller.population.members[0]._fitness === 0) {
      controller.trigger("stop");
    }

    if (controller.running) {
      setTimeout(function () {iteratePopulation(controller);}, controller.delay);
    }
  }
  
  $(jobController).on("stop", function (e) {
    jobController.running = false;
  }).on("start", function (e, population, delay) {
    jobController.population = population;
    jobController.delay = delay;
    jobController.trigger("run");
  }).on("run", function (e) {
    jobController.running = true;
    setTimeout(function () {iteratePopulation(jobController);}, jobController.delay);
  }).on("render", function (e) {
    // draw here
    $("#results").html(_.map(jobController.population.members,
                             function (m) {
                               return m.fitness(jobController.population.env) + 
                                 " / " + m.render();
                             }).join("\n"));
    $("#results_meta").text("Gen: " + jobController.population.generation);
  });
  
  $("#word-form").on("submit", function (e) {
    e.preventDefault();
    jobController.trigger("stop");
    
    var env = {word: $("#phrase").val()};
    var per_gen = + $("#per_gen").val();
    var start_length = + $("#start_length").val();
    var delay = + $("#delay").val();
    var maxAge = + $("#max_age").val();

    var creatureCtor = function () {
      return new Word(start_length);
    }; 

    var pop = new Population(env, creatureCtor, per_gen, {maxAge: maxAge});
    
    jobController.trigger("start", [pop, delay]);
  });
  
  $("#pause").on("click", function (e) {
    e.preventDefault();
    if (jobController.running) {
      jobController.trigger("stop");
    } else {
      jobController.trigger("run");
    }
  });
  
  window.jobController = jobController;

});
