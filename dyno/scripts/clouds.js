const Scene = require('Scene');
const Random = require('Random');
const Time = require('Time');
const Animation = require('Animation');

Scene.root.findFirst('canvas').then(canvas => {
  Scene.root.findFirst('cloud1').then(cloud1 => {
    Scene.root.findFirst('cloud2').then(cloud2 => {
      Scene.root.findFirst('cloud3').then(cloud3 => {
        Scene.root.findFirst('cloud4').then(cloud4 => {
          const canvasSize = {
            width: canvas.width.pinLastValue(),
            height: canvas.height.pinLastValue()
          }
          const scaleCoef = canvasSize.width / 370;
          const cloudSize = {
            width: 150 * scaleCoef,
            height: 30 * scaleCoef
          }
          // cloud1.width = cloudSize.width;
          // cloud2.width = cloudSize.width;
          // cloud3.width = cloudSize.width;
          // cloud4.width = cloudSize.width;
          cloud1.transform.y = 0.5 * canvasSize.height - 160 * scaleCoef;
          cloud2.transform.y = 0.5 * canvasSize.height - 220 * scaleCoef;
          cloud3.transform.y = 0.5 * canvasSize.height - 270 * scaleCoef;
          cloud4.transform.y = 0.5 * canvasSize.height - 320 * scaleCoef;

          let cloud1X = 0.3 * canvasSize.width + Random.random() * 0.2 * canvasSize.width,
              cloud2X = -0.6 * canvasSize.width + Random.random() * 0.2 * canvasSize.width,
              cloud3X = 0.2 * canvasSize.width + Random.random() * 0.3 * canvasSize.width,
              cloud4X = -0.5 * canvasSize.width + Random.random() * 0.5 * canvasSize.width;

          let cloud1TimeDriver = Animation.timeDriver({
            durationMilliseconds: (cloud1X - (-0.5 * canvasSize.width - cloudSize.width)) * 17,
            loopCount: 1,
            mirror: false
          })
          let cloud1Sampler = Animation.samplers.linear(cloud1X, -0.5 * canvasSize.width - cloudSize.width);
          const cloud1Animation = Animation.animate(cloud1TimeDriver, cloud1Sampler);
          cloud1.transform.x = cloud1Animation;
          cloud1TimeDriver.start();

          let cloud2TimeDriver = Animation.timeDriver({
            durationMilliseconds: (cloud2X - (-0.5 * canvasSize.width - cloudSize.width)) * 17,
            loopCount: 1,
            mirror: false
          })
          let cloud2Sampler = Animation.samplers.linear(cloud2X, -0.5 * canvasSize.width - cloudSize.width);
          const cloud2Animation = Animation.animate(cloud2TimeDriver, cloud2Sampler);
          cloud2.transform.x = cloud2Animation;
          cloud2TimeDriver.start();

          let cloud3TimeDriver = Animation.timeDriver({
            durationMilliseconds: (cloud3X - (-0.5 * canvasSize.width - cloudSize.width)) * 17,
            loopCount: 1,
            mirror: false
          })
          let cloud3Sampler = Animation.samplers.linear(cloud3X, -0.5 * canvasSize.width - cloudSize.width);
          const cloud3Animation = Animation.animate(cloud3TimeDriver, cloud3Sampler);
          cloud3.transform.x = cloud3Animation;
          cloud3TimeDriver.start();

          let cloud4TimeDriver = Animation.timeDriver({
            durationMilliseconds: (cloud4X - (-0.5 * canvasSize.width - cloudSize.width)) * 17,
            loopCount: 1,
            mirror: false
          })
          let cloud4Sampler = Animation.samplers.linear(cloud4X, -0.5 * canvasSize.width - cloudSize.width);
          const cloud4Animation = Animation.animate(cloud4TimeDriver, cloud4Sampler);
          cloud4.transform.x = cloud4Animation;
          cloud4TimeDriver.start();

          const cloudOffset = 2000;
          
          const runCloud1 = () => {
            let cloud1TimeDriver = Animation.timeDriver({
              durationMilliseconds: (0.5 * canvasSize.width + cloudSize.width - (-0.5 * canvasSize.width - cloudSize.width)) * 17,
              loopCount: 1,
              mirror: false
            })
            let cloud1Sampler = Animation.samplers.linear(0.5 * canvasSize.width + cloudSize.width, -0.5 * canvasSize.width - cloudSize.width);
            const cloud1Animation = Animation.animate(cloud1TimeDriver, cloud1Sampler);
            cloud1.transform.x = cloud1Animation;
            cloud1TimeDriver.start();

            cloud1TimeDriver.onCompleted().subscribe(() => {
              Time.setTimeout(runCloud1, Random.random() * cloudOffset);
            });
          };
          cloud1TimeDriver.onCompleted().subscribe(() => {
            Time.setTimeout(runCloud1, Random.random() * cloudOffset);
          });

          const runCloud2 = () => {
            let cloud1TimeDriver = Animation.timeDriver({
              durationMilliseconds: (0.5 * canvasSize.width + cloudSize.width - (-0.5 * canvasSize.width - cloudSize.width)) * 17,
              loopCount: 1,
              mirror: false
            })
            let cloud1Sampler = Animation.samplers.linear(0.5 * canvasSize.width + cloudSize.width, -0.5 * canvasSize.width - cloudSize.width);
            const cloud1Animation = Animation.animate(cloud1TimeDriver, cloud1Sampler);
            cloud2.transform.x = cloud1Animation;
            cloud1TimeDriver.start();

            cloud1TimeDriver.onCompleted().subscribe(() => {
              Time.setTimeout(runCloud2, Random.random() * cloudOffset);
            });
          };
          cloud2TimeDriver.onCompleted().subscribe(() => {
            Time.setTimeout(runCloud2, Random.random() * cloudOffset);
          });

          const runCloud3 = () => {
            let cloud1TimeDriver = Animation.timeDriver({
              durationMilliseconds: (0.5 * canvasSize.width + cloudSize.width - (-0.5 * canvasSize.width - cloudSize.width)) * 17,
              loopCount: 1,
              mirror: false
            })
            let cloud1Sampler = Animation.samplers.linear(0.5 * canvasSize.width + cloudSize.width, -0.5 * canvasSize.width - cloudSize.width);
            const cloud1Animation = Animation.animate(cloud1TimeDriver, cloud1Sampler);
            cloud3.transform.x = cloud1Animation;
            cloud1TimeDriver.start();

            cloud1TimeDriver.onCompleted().subscribe(() => {
              Time.setTimeout(runCloud3, Random.random() * cloudOffset);
            });
          };
          cloud3TimeDriver.onCompleted().subscribe(() => {
            Time.setTimeout(runCloud3, Random.random() * cloudOffset);
          });

          const runCloud4 = () => {
            let cloud1TimeDriver = Animation.timeDriver({
              durationMilliseconds: (0.5 * canvasSize.width + cloudSize.width - (-0.5 * canvasSize.width - cloudSize.width)) * 17,
              loopCount: 1,
              mirror: false
            })
            let cloud1Sampler = Animation.samplers.linear(0.5 * canvasSize.width + cloudSize.width, -0.5 * canvasSize.width - cloudSize.width);
            const cloud1Animation = Animation.animate(cloud1TimeDriver, cloud1Sampler);
            cloud4.transform.x = cloud1Animation;
            cloud1TimeDriver.start();

            cloud1TimeDriver.onCompleted().subscribe(() => {
              Time.setTimeout(runCloud4, Random.random() * cloudOffset);
            });
          };
          cloud4TimeDriver.onCompleted().subscribe(() => {
            Time.setTimeout(runCloud4, Random.random() * cloudOffset);
          });
        });
      });
    });
  });
});