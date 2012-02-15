"use strict";
$(function () {
  
  function Polygons (ps, vs) {
    var num_color_genes = 4;
    // genes = vertices-per-polygon, [r, g, b, a, x1, y1, x2, y2,
    // ...]+
    var genes_per_polygon = num_color_genes + (vs * 2);
    var num_genes = 1 + (genes_per_polygon * ps); 
    this.genes = _.map(_.range(num_genes), _.bind(this.newGene, this));
    this.genes[0] = 1 / vs;
    this.canvas = document.createElement("canvas");
    this.canvas.height = 300;
    this.canvas.width = 300;
  }
  Polygons.prototype = new genetic.Creature(0);
  
  _.extend(Polygons.prototype, {
    clear: function () {
      this._image = null;
    },
    newGene: function () {
      return Math.random();
    },
    mutateGene: function (gene) {
      return Math.random();
    },
    fitness: function (env) {
      if (!this._image) this.drawImage();
      
      var difference = 0;
      for (var i = 0, l = this._image.data.length; i < l; i+=3) {
        difference += Math.abs(this._image.data[i] - env.image.data[i]);
      }
      this._fitness = difference;
      return this._fitness;
    },
    drawImage: function () {
      var ctx = this.canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 300, 300);
      var coords = Math.floor(1 / this.genes[0]) * 2;
      for (var i = 1, l = this.genes.length; i < l; i += coords + 4) {
        var colors = this.genes.slice(i, i + 4);
        var xs_ys = this.genes.slice(i + 4, i + coords);
        ctx.beginPath();
        var first = true;
        ctx.strokeStyle = "#000";
        var fillColor = "rgba(" + Math.floor(256 * colors[0]) + "," + 
          Math.floor(256 * colors[1]) + "," + 
          Math.floor(256 * colors[2]) + "," + 
          ((colors[3] / 2) + 0.25) + ")";
        ctx.fillStyle = fillColor;
        for (var j = 0, k = xs_ys.length; j < k; j += 2) {
          var x = xs_ys[j], y = xs_ys[j + 1];
          if (!(x && y)) continue;
          if (first) {
            ctx.moveTo(x * 300, y * 300);
            first = false;
          } else {
            ctx.lineTo(x * 300, y * 300);
          }
        }
        ctx.closePath();
        ctx.fill();
      }
      this._image = ctx.getImageData(0, 0, 300, 300);
      return this;
    },
    render: function (env) {
      if (!this._image) this.drawImage();
      var ctx = env.canvas.getContext("2d");
      ctx.putImageData(this._image, 0, 0);
    }
  });

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
    var best = jobController.population.members[0];
    jobController.population.env.canvas.getContext("2d").clearRect(0,0,300,300);
    best.render(jobController.population.env);
    $("#results_meta").text("Gen: " + jobController.population.generation + 
                            " Fitness: " + best._fitness);
  });
  
  $("#image-form").on("submit", function (e) {
    e.preventDefault();
    jobController.trigger("stop");
    
    var imageURL = $("#image").val();
    var imageEl = new Image;
    imageEl.src = imageURL;
    imageEl.onload = function () {
      var canvas, ctx, imageData;
      canvas = $("#input-image");
      canvas.attr({height: 300, width: 300});
      ctx = canvas.get(0).getContext("2d");
      ctx.drawImage(imageEl, 0, 0, 300, 300);
      imageData = ctx.getImageData(0, 0, 300, 300);
      
      var env = {image: imageData, canvas: $("#output-image").get(0)},
          per_gen = + $("#per_gen").val(),
          maxAge = + $("#max_age").val(),
          numPolys = + $("#num_polygons").val(),
          numVerts = + $("#num_vertices").val(),
          delay = + $("#delay").val();
      
      var creatureCtor = function () {
        return new Polygons(numPolys, numVerts);
      }; 
      
      var pop = new genetic.Population(env, creatureCtor, per_gen, {maxAge: maxAge});
      
      jobController.trigger("start", [pop, delay]);
    };
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
