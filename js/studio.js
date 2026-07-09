(function () {
  function bindModeToggle(button) {
    button.addEventListener("click", function () {
      document.body.classList.toggle("studio-focus");
      button.setAttribute(
        "aria-pressed",
        document.body.classList.contains("studio-focus") ? "true" : "false"
      );
    });
  }

  function bindIndexRows() {
    var rows = Array.prototype.slice.call(document.querySelectorAll(".studio-index-row"));
    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        rows.forEach(function (item) {
          item.classList.toggle("is-active", item === row);
        });
      });
      row.addEventListener("mouseleave", function () {
        row.classList.remove("is-active");
      });
    });
  }

  function bindFilters() {
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-work-filter]"));
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-work-category]"));

    filters.forEach(function (filter) {
      filter.addEventListener("click", function () {
        var active = filter.getAttribute("data-work-filter");

        filters.forEach(function (button) {
          button.classList.toggle("is-active", button === filter);
        });

        items.forEach(function (item) {
          var category = item.getAttribute("data-work-category");
          item.hidden = active !== "all" && category !== active;
        });
      });
    });
  }

  function bindFeatheredViewport(root) {
    var canvas = root.querySelector("[data-feather-stars]");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var orbitalSparks = [];
    var burstParticles = [];
    var width = 0;
    var height = 0;
    var dpr = 1;
    var raf = 0;
    var lastTime = 0;
    var targetPointerX = 0;
    var targetPointerY = 0;
    var pointerX = 0;
    var pointerY = 0;
    var targetPresence = 1;
    var presence = 1;
    var burstEnergy = 0;
    var shakeX = 0;
    var shakeY = 0;

    var ring = {
      cx: 0,
      cy: 0,
      radius: 0,
      yScale: 0.88
    };

    function random(min, max) {
      return min + Math.random() * (max - min);
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function makeProfile() {
      return {
        warmth: Math.random(),
        haloScale: random(3.6, 5.8),
        flickerPhase: random(0, Math.PI * 2),
        shimmer: random(0.72, 1.22)
      };
    }

    function makeOrbitalSpark() {
      return Object.assign({
        angle: random(0, Math.PI * 2),
        dist: random(0.055, 0.47),
        size: random(1.1, 3.3),
        speed: random(0.0003, 0.001),
        drift: random(-0.00045, 0.00045),
        fallSpeed: random(0.00007, 0.00024),
        twinklePhase: random(0, Math.PI * 2),
        twinkleSpeed: random(1.5, 4.5)
      }, makeProfile());
    }

    function makeBurstParticle() {
      var angle = -Math.PI * 0.12 - Math.random() * Math.PI * 0.78;
      var power = random(0.75, 1.95);
      return Object.assign({
        x: ring.cx + pointerX * ring.radius * 0.18 + random(-30, 30),
        y: ring.cy + pointerY * ring.radius * 0.12 + random(-15, 35),
        vx: Math.cos(angle) * ring.radius * 0.36 * power + random(-60, 60),
        vy: Math.sin(angle) * ring.radius * 0.72 * power,
        gravity: ring.radius * random(0.07, 0.16),
        drag: random(0.942, 0.985),
        size: random(0.85, 2.6),
        life: random(2.5, 4.7),
        age: 0,
        twinklePhase: random(0, Math.PI * 2),
        twinkleSpeed: random(2.1, 5.4),
        orbitalDrift: random(-0.7, 0.7)
      }, makeProfile());
    }

    function resize() {
      var rect = root.getBoundingClientRect();
      width = rect.width * 1.1;
      height = rect.height * 1.1;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var side = Math.min(width, height);
      ring.cx = width * 0.5;
      ring.cy = height * 0.5;
      ring.radius = side;

      orbitalSparks = Array.from({ length: 168 }, makeOrbitalSpark);
    }

    function setShake(x, y) {
      shakeX = x;
      shakeY = y;
      root.style.setProperty("--shake-x", x.toFixed(3) + "px");
      root.style.setProperty("--shake-y", y.toFixed(3) + "px");
    }

    function updatePointer(event) {
      var rect = root.getBoundingClientRect();
      var localX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      var localY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      targetPointerX = localX * 2 - 1;
      targetPointerY = localY * 2 - 1;
      root.style.setProperty("--x", (localX * 100).toFixed(2) + "%");
      root.style.setProperty("--y", (localY * 100).toFixed(2) + "%");
    }

    function edgeFalloff(x, y) {
      var dx = (x - ring.cx) / (ring.radius * 0.4);
      var dy = (y - ring.cy) / (ring.radius * 0.345);
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (distance >= 1.02) return 0;
      if (distance <= 0.72) return 1;
      return Math.pow(Math.max(0, 1 - (distance - 0.72) / 0.3), 0.7);
    }

    function keepInEllipse(particle) {
      var rx = ring.radius * 0.405;
      var ry = ring.radius * 0.35;
      var dx = (particle.x - ring.cx) / rx;
      var dy = (particle.y - ring.cy) / ry;
      var distance = dx * dx + dy * dy;
      if (distance <= 1) return;

      var scale = 1 / Math.sqrt(distance);
      particle.x = ring.cx + (particle.x - ring.cx) * scale * 0.992;
      particle.y = ring.cy + (particle.y - ring.cy) * scale * 0.992;
      particle.vx *= 0.56;
      particle.vy *= 0.56;
    }

    function drawSpark(x, y, radius, alpha, brightness, profile) {
      if (alpha < 0.01) return;

      var red;
      var green;
      var blue;

      if (profile.warmth < 0.22) {
        red = 185; green = 210; blue = 255;
      } else if (profile.warmth < 0.5) {
        red = 255; green = 255; blue = 240;
      } else if (profile.warmth < 0.76) {
        red = 255; green = 220; blue = 180;
      } else {
        red = 205; green = 238; blue = 225;
      }

      ctx.save();
      ctx.globalAlpha = alpha;

      var halo = ctx.createRadialGradient(x, y, 0, x, y, radius * profile.haloScale);
      halo.addColorStop(0, "rgba(" + red + "," + green + "," + blue + ",0.45)");
      halo.addColorStop(0.22, "rgba(" + red + "," + green + "," + blue + ",0.11)");
      halo.addColorStop(1, "rgba(" + red + "," + green + "," + blue + ",0)");
      ctx.fillStyle = halo;
      ctx.fillRect(x - radius * 6, y - radius * 6, radius * 12, radius * 12);

      ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      if (brightness > 0.62 && radius > 1.1) {
        var cross = radius * 2.45;
        ctx.strokeStyle = "rgba(" + red + "," + green + "," + blue + "," + alpha * 0.34 + ")";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - cross, y);
        ctx.lineTo(x + cross, y);
        ctx.moveTo(x, y - cross);
        ctx.lineTo(x, y + cross);
        ctx.stroke();
      }

      ctx.restore();
    }

    function explode() {
      burstEnergy = 1;
      targetPresence = 1;
      presence = Math.max(presence, 0.45);
      setShake(random(-3, 3), random(-2.6, 2.6));

      if (burstParticles.length > 900) {
        burstParticles.splice(0, burstParticles.length - 900);
      }

      for (var i = 0; i < 300; i += 1) {
        burstParticles.push(makeBurstParticle());
      }
    }

    function tick(frameTime) {
      var time = frameTime * 0.001;
      var delta = Math.min((frameTime - lastTime) * 0.001 || 0, 0.05);
      lastTime = frameTime;

      ctx.clearRect(0, 0, width, height);

      presence += (targetPresence - presence) * 0.045;
      pointerX += (targetPointerX - pointerX) * 0.05;
      pointerY += (targetPointerY - pointerY) * 0.05;
      burstEnergy *= Math.pow(0.965, delta * 60);

      if (Math.abs(shakeX) > 0.01 || Math.abs(shakeY) > 0.01) {
        setShake(shakeX * Math.pow(0.86, delta * 60), shakeY * Math.pow(0.86, delta * 60));
      }

      orbitalSparks.forEach(function (spark) {
        spark.angle += (spark.speed + spark.drift * pointerX) * delta * 1000;
        spark.dist += spark.fallSpeed * delta * 0.18;
        if (spark.dist > 0.49) spark.dist = 0.055;

        var radius = ring.radius * spark.dist;
        var x = ring.cx + Math.cos(spark.angle) * radius + pointerX * ring.radius * 0.018;
        var y = ring.cy + Math.sin(spark.angle) * radius * ring.yScale + pointerY * ring.radius * 0.014;
        var twinkle = 0.48 + Math.sin(time * spark.twinkleSpeed + spark.twinklePhase) * 0.38;
        var falloff = edgeFalloff(x, y);
        drawSpark(x, y, spark.size, presence * falloff * twinkle * 0.58, twinkle, spark);
      });

      burstParticles = burstParticles.filter(function (particle) {
        particle.age += delta;
        if (particle.age > particle.life) return false;

        particle.vy += particle.gravity * delta;
        particle.vx *= Math.pow(particle.drag, delta * 60);
        particle.vy *= Math.pow(particle.drag, delta * 60);
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.x += Math.sin(time * 0.85 + particle.twinklePhase) * particle.orbitalDrift * delta * 8;
        keepInEllipse(particle);

        var lifeAlpha = 1 - particle.age / particle.life;
        var twinkle = 0.58 + Math.sin(time * particle.twinkleSpeed + particle.twinklePhase) * 0.42;
        drawSpark(
          particle.x,
          particle.y,
          particle.size * (1 + burstEnergy * 0.35),
          lifeAlpha * twinkle * edgeFalloff(particle.x, particle.y),
          twinkle,
          particle
        );

        return true;
      });

      raf = window.requestAnimationFrame(tick);
    }

    function onEnter(event) {
      targetPresence = 1;
      updatePointer(event);
    }

    function onMove(event) {
      updatePointer(event);
    }

    function onLeave() {
      targetPresence = 0.72;
      targetPointerX = 0;
      targetPointerY = 0;
      root.style.setProperty("--x", "50%");
      root.style.setProperty("--y", "50%");
    }

    function onDown(event) {
      if (event.button !== 0) return;
      updatePointer(event);
      explode();
    }

    resize();
    window.addEventListener("resize", resize);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    raf = window.requestAnimationFrame(tick);
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-studio-mode]")).forEach(bindModeToggle);
    Array.prototype.slice.call(document.querySelectorAll("[data-feather-viewport]")).forEach(bindFeatheredViewport);
    bindIndexRows();
    bindFilters();
  });
})();
