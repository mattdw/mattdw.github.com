"use strict";
(function () {
  
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
      if (genes.length === 0) return genes;
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
    child.clear();
    child._fitness = 0;
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
      keep = Math.max(Math.floor(this.size / 3), 2);
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
 
  window.genetic = {
    Creature: Creature,
    Population: Population
  };
})();
