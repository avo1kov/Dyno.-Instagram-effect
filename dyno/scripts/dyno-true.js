/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 */

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//
// For projects created with v87 onwards, JavaScript is always executed in strict mode.
//==============================================================================

// How to load in modules
const Scene = require('Scene');
const Reactive = require('Reactive');
const Diagnostics = require('Diagnostics');
const Animation = require('Animation');
const Materials = require('Materials');
// const Textures = require('Textures');
const Time = require('Time');
const Random = require('Random');
const TouchGestures = require('TouchGestures');
const FaceTracking = require('FaceTracking');
const FaceGestures = require('FaceGestures');
const CameraInfo = require('CameraInfo');
// const Patches = require('Patches');
// const screenSize = Patches.getPoint2DValue('screenSize');

// Use import keyword to import a symbol from another file
// import { animationDuration } from './script.js'

// Materials and Textures
const singleCactusMaterial = Materials.get('single_cactus');
const doubleCactusMaterial = Materials.get('double_cactus');
const tripleCactusMaterial = Materials.get('triple_cactus');
const dynoDefaultMaterial = Materials.get('dyno_default');
const dyno1Material = Materials.get('dyno_1');
const dyno2Material = Materials.get('dyno_2');
const dynoFinalMaterial = Materials.get('dyno_final');
const bird1Material = Materials.get('bird_1');
const bird2Material = Materials.get('bird_2');
const bump1Material = Materials.get('bump_1');
const bump2Material = Materials.get('bump_2');

const face = FaceTracking.face(0);
const groundHeight = 190;
let dynoSize = { width: 0, height: 0, x: 0, y: 0 },
canvasSize = { width: 0, height: 0, x: 0, y: 0 },
groundSize = { width: 0, height: 0, x: 0, y: 0 },
groundLinesSize = { width: 0, height: 0, x: 0, y: 0 },
obstacleSize = { width: 0, height: 0, x: 0, y: 0 },
horizonSize = { width: 0, height: 0, x: 0, y: 0 },
bumpSize = { width: 0, height: 0, x: 0, y: 0 },
replayButtonSize = { width: 0, height: 0, x: 0, y: 0 };

let dynoIsJumping = false;
let score = 0;
let birdInterval = Time.setInterval(() => {}, 10000), birdMaterialFlag = false, obstacleSpeedOffset = 0;
let gameOverInterval = Time.setTimeout(() => {}, 10000);
let firstDynoJumpDriver = Animation.timeDriver({
  durationMilliseconds: 200,
  loopCount: 1,
  mirror: true
});
let secondDynoJumpDriver = firstDynoJumpDriver;
let bump1TimeDriver = firstDynoJumpDriver, bump2TimeDriver = firstDynoJumpDriver;
let longJumpingTimer = Time.setTimeout(() => {}, 0);

const groundFramesCount = 10;
let groundFramesIterator = groundFramesCount;

let dynoLegsInterval, scoreInterval;
let allowedStartGameByBlink = true;
let isPlaying = false;


let firstGameStart = true;
const slowestGameDuration = 4000, fastestGameDuration = 1000;
let gameDuration = slowestGameDuration;
let frameDuration = gameDuration / groundFramesCount;

Scene.root.findFirst('canvas').then(canvas => {
  Scene.root.findFirst('dyno').then(dyno => {
    Scene.root.findFirst('ground').then(ground => {
      Scene.root.findFirst('ground_lines').then(groundLines => {
        Scene.root.findFirst('obstacle').then(obstacle => {
          Scene.root.findFirst('horizon').then(horizon => {
            Scene.root.findFirst('game_over').then(gameOverText => {
              Scene.root.findFirst('game_over_outlined').then(gameOverOutlinedText => {
                Scene.root.findFirst('replay_button').then(replayButton => {
                  Scene.root.findFirst('score').then(scoreText => {
                    Scene.root.findFirst('score_outlined').then(scoreOutlinedText => {
                      Scene.root.findFirst('bump').then(bump => {
                        Scene.root.findFirst('instabutton').then(instabutton => {
                          Scene.root.findFirst('Device').then(device => {

                          // Size and location presets
                          canvasSize.width = canvas.width.pinLastValue();
                          canvasSize.height = canvas.height.pinLastValue();
                          
                          // canvasSize.width = screenSize.x.pinLastValue();
                          // canvasSize.height = screenSize.y.pinLastValue();

                          const scaleCoef = canvasSize.width / 370;
                          // Diagnostics.log(`Coefficient: ${scaleCoef}`);
                          // Diagnostics.log(`Size: ${canvasSize.width} ${canvasSize.height}`);
                          // Diagnostics.watch('x', );
                          // Diagnostics.watch('y', screenSize.y);
                          // instabutton.transform.y = -0.5 * canvasSize.height + 303 / 4 + 65 / 2;
                          
                          // groundSize.width = canvasSize.width;
                          // groundSize.height = groundHeight;
                          // groundSize.y = -0.5 * canvasSize.height + 0.5 * groundSize.height;

                          groundSize.width = ground.width.pinLastValue();
                          groundSize.height = ground.height.pinLastValue();
                          groundSize.y = ground.transform.y.pinLastValue();
                          // ground.width = groundSize.width;
                          // ground.height = groundSize.height;
                          // ground.transform.y = groundSize.y;
                          
                          groundLinesSize.width = 1024 * scaleCoef;
                          groundLinesSize.height = 20 * scaleCoef;
                          groundLinesSize.y = -0.5 * canvasSize.height + groundSize.height - 0.5 * groundLinesSize.height - 5 * scaleCoef;
                          // groundLinesSize.x = 0.5 * groundLinesSize.width - 0.5 * canvasSize.width;
                          // groundLines.width = groundLinesSize.width;
                          // groundLines.height = groundLinesSize.height;
                          // groundLines.transform.y = groundLinesSize.y;
                          groundLines.transform.x = groundLinesSize.x;

                          dynoSize.width = 96 * scaleCoef;
                          dynoSize.height = 102  * scaleCoef;
                          dynoSize.y = -0.5 * canvasSize.height + groundSize.height + 31 * scaleCoef;
                          dynoSize.x = -0.5 * canvasSize.width + 0.5 * dynoSize.width + 20 * scaleCoef;
                          // dyno.width = dynoSize.width;
                          // dyno.height = dynoSize.height;
                          // dyno.transform.y = dynoSize.y;
                          // dyno.transform.x = dynoSize.x;

                          horizonSize.width = canvasSize.width;
                          horizonSize.height = 4 * scaleCoef;
                          horizonSize.y = -0.5 * canvasSize.height + groundSize.height + 0.5 * horizonSize.height;
                          // horizon.width = horizonSize.width;
                          // horizon.height = horizonSize.height;
                          // horizon.transform.y = horizonSize.y;

                          obstacleSize.width = 100;
                          obstacleSize.height = 100;
                          obstacleSize.y = -0.5 * canvasSize.height + groundSize.height + 31 * scaleCoef;
                          obstacleSize.x = -canvasSize.width;
                          // obstacle.width = obstacleSize.width;
                          // obstacle.height = obstacleSize.height;
                          // obstacle.transform.y = obstacleSize.y;
                          // obstacle.transform.x = obstacleSize.x;

                          bumpSize.width = 100;
                          bumpSize.height = 100;
                          bumpSize.y = -0.5 * canvasSize.height + groundSize.height + 31 * scaleCoef;
                          bumpSize.x = -canvasSize.width;
                          // bump.width = bumpSize.width;
                          // bump.height = bumpSize.height;
                          // bump.transform.y = bumpSize.y;
                          // bump.transform.x = bumpSize.x;

                          const groundFrameWidth = groundLinesSize.width / groundFramesCount;

                          // Score text presets
                          // const scaleCoef = canvas.width.pinLastValue() / 370;
                          // scoreText.transform.x = -5;
                          // scoreText.fontSize = 85;
                          // scoreOutlinedText.fontSize = 85;
                          // scoreOutlinedText.transform.scaleX = scaleCoef;
                          // scoreOutlinedText.transform.scaleY = scaleCoef;
                          // scoreOutlinedText.transform.y = 0.5 * canvas.height.pinLastValue() - 95 * scaleCoef;

                          // const gameOverScaleCoef = canvas.width.pinLastValue() / 370;
                          // gameOverOutlinedText.transform.scaleX = scaleCoef;
                          // gameOverOutlinedText.transform.scaleY = scaleCoef;
                          // gameOverOutlinedText.transform.y = 0.5 * canvas.height.pinLastValue() - 145 * scaleCoef;

                          dyno.material = dynoDefaultMaterial;

                          let groundTimeDriver = Animation.timeDriver({
                            durationMilliseconds: 0,
                            loopCount: 0,
                            mirror: false
                          });
                          let obstacleCactusTimeDriver = groundTimeDriver;
                          let timeIterator = 0;
                          const runGame = () => {
                            firstGameStart = false;
                            dyno.transform.y = Reactive.val(-0.5 * canvas.height.pinLastValue() + 0.5 * dyno.height.pinLastValue() * scaleCoef + ground.height.pinLastValue() * scaleCoef - 22 * scaleCoef);
                            dynoIsJumping = false;
                            score = 0;
                            timeIterator = 0;
                            obstacle.transform.x = -canvas.width.pinLastValue();
                            isPlaying = true;
                            gameDuration = slowestGameDuration;

                            Time.setTimeout(updateGameDuration, 0);
                            Time.setTimeout(checkGameOver, 0);
                            Time.setTimeout(moveGround, 0);
                            Time.setTimeout(generateObstacles, 0);
                            Time.setTimeout(generateBump, 0);

                            Time.clearTimeout(gameOverInterval);

                            let dynoSteps = 0, dynoMaterialFlag = false;
                            dynoLegsInterval = Time.setInterval(() => {
                              if (isPlaying) {
                                const freq = 5000;
                                if (!dynoIsJumping && dynoSteps > gameDuration / freq) {
                                  dyno.material = dynoMaterialFlag ? dyno1Material : dyno2Material;
                                  dynoMaterialFlag = !dynoMaterialFlag;
                                  dynoSteps = 0;
                                } else if (dynoIsJumping && dynoSteps > 5) {
                                  dyno.material = dynoMaterialFlag ? dyno1Material : dyno2Material;
                                  dynoMaterialFlag = !dynoMaterialFlag;
                                  dynoSteps = 0;
                                }
                                dynoSteps += 1;
                              }
                            }, 40); 

                            scoreInterval = Time.setInterval(() => {
                              score += 0.1;
                              let text = (Math.round((score * 100)) / 100).toString();
                              if (score < 10 && text != "10") {
                                text = '0' + text;
                              }
                              if (text.length < 4) {
                                text += '.0';
                              }
                              scoreText.text = text + " sec";
                              scoreOutlinedText.text = text + " sec";
                            }, 100);

                            gameOverOutlinedText.hidden = true;
                            replayButton.hidden = true;
                          }

                          const stopGame = () => {
                            isPlaying = false;
                            obstacleCactusTimeDriver.stop();
                            groundTimeDriver.stop();
                            firstDynoJumpDriver.stop();
                            secondDynoJumpDriver.stop();
                            bump1TimeDriver.stop();
                            bump2TimeDriver.stop();
                            Time.clearInterval(dynoLegsInterval);
                            Time.clearInterval(scoreInterval);
                            Time.clearInterval(birdInterval);
                            Time.clearTimeout(longJumpingTimer);
                            allowedStartGameByBlink = false;
                            gameOverOutlinedText.hidden = false;
                            // replayButton.hidden = false;
                            dyno.material = dynoFinalMaterial;
                            
                            gameOverInterval = Time.setTimeout(makeTypeInGameOver, 600);
                          }

                          const updateGameDuration = () => {
                            if (isPlaying) {
                              // gameDuration -= 100;
                              gameDuration = slowestGameDuration * (-Math.pow(timeIterator, 2) + 1) + fastestGameDuration;
                              timeIterator += 0.001;
                              frameDuration = gameDuration / groundFramesCount
                              Time.setTimeout(updateGameDuration, 1000);
                            }
                          };

                          const makeTypeInGameOver = () => {
                            const typos = ['0', '7', '1', 't', 'f'];
                            let gameOverString = "game over";
                            let typoIndex = Math.round(Random.random() * (gameOverString.length - 1))
                            if (typoIndex == 4) {
                              typoIndex = 5;
                            }
                            let gameOverCharArray = gameOverString.split('');
                            const typo = typos[Math.round(Random.random() * (typos.length - 1))];
                            const randomIndex = Math.round(Random.random() * 3);
                            switch (randomIndex) {
                              case 0:
                                gameOverCharArray[5] = typo;
                                break;

                              case 1:
                                gameOverCharArray[2] = typo;
                                break;

                              case 2:
                                gameOverCharArray[7] = typo;
                                break;
                              
                              default:
                                gameOverCharArray[3] = typo;
                                break;
                            }
                            
                            const typodGameOverString = gameOverCharArray.join('');
                            gameOverOutlinedText.text = typodGameOverString;
                            gameOverText.text = typodGameOverString;

                            Time.setTimeout(() => {
                              gameOverOutlinedText.text = gameOverString;
                              gameOverText.text = gameOverString;
                            }, 200 + Random.random() * 300);
                            Time.setTimeout(makeTypeInGameOver, 2000 + Random.random() * 5000);
                          }

                          let leftEyeClosed = FaceGestures.hasLeftEyeClosed(face, {threshold: 0.5, backlash: 0.1});

                          const jump = () => {
                            if (!dynoIsJumping && isPlaying) {
                              dynoIsJumping = true;
                              firstDynoJumpDriver = Animation.timeDriver({
                                durationMilliseconds: 200,
                                loopCount: 1,
                                mirror: true
                              });

                              const dynoJumpSampler = Animation.samplers.easeOutCirc(
                                dynoSize.y,
                                dynoSize.y + 140
                                -0.5 * canvasSize.height + groundSize.height + 31 * scaleCoef,
                                -0.5 * canvasSize.height + groundSize.height + 31 * scaleCoef + 140 * scaleCoef
                              );
                              const dynoJumpAnimation = Animation.animate(firstDynoJumpDriver, dynoJumpSampler);
                              dyno.transform.y = dynoJumpAnimation;

                              firstDynoJumpDriver.start();
                              firstDynoJumpDriver.onCompleted().subscribe(() => {
                                const backDown = () => {
                                  if (isPlaying) {
                                    secondDynoJumpDriver = Animation.timeDriver({
                                      durationMilliseconds: 800,
                                      loopCount: 1,
                                      mirror: true
                                    });
                  
                                    const dynoJumpSampler = Animation.samplers.easeInQuart(
                                      -0.5 * canvasSize.height + groundSize.height + 31 * scaleCoef + 140 * scaleCoef,
                                      -0.5 * canvasSize.height + groundSize.height + 31 * scaleCoef
                                    );
                                    const dynoJumpAnimation = Animation.animate(secondDynoJumpDriver, dynoJumpSampler);
                                    dyno.transform.y = dynoJumpAnimation;
                  
                                    secondDynoJumpDriver.start();
                                    secondDynoJumpDriver.onCompleted().subscribe(() => {
                                      if (isPlaying) {
                                        dyno.transform.y = -0.5 * canvasSize.height + groundSize.height + 31 * scaleCoef;
                                        dynoIsJumping = false;
                                      }
                                  });
                                  }
                                }
                                if (leftEyeClosed.pinLastValue()) {
                                  longJumpingTimer = Time.setTimeout(backDown, 200);
                                } else {
                                  backDown();
                                }
                              });
                            }
                          };
                          FaceGestures.hasLeftEyeClosed(face, {threshold: 0.5, backlash: 0.1}).monitor().subscribe(() => {
                            if (!isPlaying && allowedStartGameByBlink) {
                              // runGame();
                            }
                            jump();
                          });
                          FaceGestures.hasRightEyeClosed(face, {threshold: 0.5, backlash: 0.1}).monitor().subscribe(() => {
                            if (!isPlaying && allowedStartGameByBlink) {
                              // runGame();
                              
                            }
                            jump();
                          });
                          TouchGestures.onTap(replayButton).subscribe(() => {
                            // runGame();
                          });
                          TouchGestures.onTap().subscribe(() => {
                            if (!isPlaying && firstGameStart) {
                              // runGame();
                            }
                            isPlaying = true;
                            jump();
                          });
                          CameraInfo.isRecordingVideo.monitor().subscribe(() => {
                            if (!isPlaying) {
                              runGame();
                            }
                          });
                          // && dyno.transform.y.pinLastValue() + dynoYBorder > obstacle.transform.y.pinLastValue() - 0.5 * obstacle.height
                          // && dyno.transform.y.pinLastValue() - dynoYBorder < obstacle.transform.y.pinLastValue() + 0.5 * obstacle.height

                          const dynoXBorder = 0.5 * dynoSize.width - 20 * scaleCoef,
                                dynoYBorder = 0.5 * dynoSize.height - 20 * scaleCoef;
                          const checkGameOver = () => {
                            if (dyno.transform.x.pinLastValue() + dynoXBorder > obstacle.transform.x.pinLastValue() - 0.5 * obstacleSize.width
                            && dyno.transform.x.pinLastValue() - dynoXBorder < obstacle.transform.x.pinLastValue() + 0.5 * obstacleSize.width
                            && dyno.transform.y.pinLastValue() - dynoYBorder < obstacle.transform.y.pinLastValue() + 0.5 * obstacleSize.height
                            && dyno.transform.y.pinLastValue() + dynoYBorder > obstacle.transform.y.pinLastValue() - 0.5 * obstacleSize.height
                            ) {
                              Diagnostics.log(`was ${dyno.transform.y.pinLastValue() - dynoYBorder} ${0.5 * obstacle.height}`);
                              stopGame();
                            }
                            if (isPlaying) {
                              Time.setTimeout(checkGameOver, 30);
                            }
                          }

                          const moveGround = () => {
                            if (isPlaying) {
                              groundTimeDriver = Animation.timeDriver({
                                durationMilliseconds: frameDuration,
                                loopCount: 1,
                                mirror: false
                              })
                              
                              let firstGroundSampler;
                              let singleCactusSampler;
                              if (groundFramesIterator < groundFramesCount / 2 - 1) {
                                firstGroundSampler = Animation.samplers.linear(
                                  groundLines.transform.x.pinLastValue(),
                                  groundLines.transform.x.pinLastValue() - groundFrameWidth,
                                );

                                groundFramesIterator++;
                              } else {
                                firstGroundSampler = Animation.samplers.linear(
                                  -0.5 * canvasSize.width + 0.5 * groundLinesSize.width,
                                  -0.5 * canvasSize.width + 0.5 * groundLinesSize.width - groundFrameWidth
                                );
                                groundFramesIterator = 0;
                              }

                              const firstGroundAnimation = Animation.animate(groundTimeDriver, firstGroundSampler);
                              groundLines.transform.x = firstGroundAnimation;

                              groundTimeDriver.start()
                              groundTimeDriver.onCompleted().subscribe(() => {
                                if (isPlaying) {
                                  moveGround();
                                }
                              });
                            }
                          }

                          function generateObstacles() {
                            if (isPlaying) {
                              obstacleCactusTimeDriver = Animation.timeDriver({
                                durationMilliseconds: frameDuration,
                                loopCount: 1,
                                mirror: false
                              })
                              let singleCactusSampler = Animation.samplers.linear(1, -1);
                              if (obstacle.transform.x.pinLastValue() + obstacle.width.pinLastValue() < -0.5 * canvas.width.pinLastValue()) {
                                Time.clearInterval(birdInterval);
                                obstacleSpeedOffset = 0;
                                const obstacleKind = Math.round(Random.random() * 1);
                                switch (obstacleKind) {
                                  case 0:
                                    const cactusKind = Math.round(Random.random() * 2);
                                    switch (cactusKind) {
                                      case 0:
                                        obstacleSize.width = 54 * scaleCoef;
                                        obstacleSize.height = 100 * scaleCoef;
                                        obstacleSize.y = -0.5 * canvasSize.height + groundSize.height + 20 * scaleCoef;
                                        obstacle.material = singleCactusMaterial;
                                        break;

                                      case 1:
                                        obstacleSize.width = 78 * scaleCoef;
                                        obstacleSize.height = 80 * scaleCoef;
                                        obstacleSize.y = -0.5 * canvasSize.height + groundSize.height + 20 * scaleCoef;
                                        obstacle.material = doubleCactusMaterial;
                                        break;

                                      case 2:
                                        obstacleSize.width = 83 * scaleCoef;
                                        obstacleSize.height = 80 * scaleCoef;
                                        obstacleSize.y = -0.5 * canvasSize.height + groundSize.height + 20 * scaleCoef;
                                        obstacle.material = tripleCactusMaterial;
                                        break;

                                      deafult:
                                        Diagnostics.log(`Something went wrong`);
                                    }
                                    break;

                                  case 1:
                                    obstacleSize.width = 98 * scaleCoef;
                                    obstacleSize.height = 86 * scaleCoef;
                                    obstacleSize.y = -0.5 * canvasSize.height + groundSize.height + (50 + 90 * Math.round(Random.random())) * scaleCoef;
                                    obstacle.material = bird1Material;

                                    obstacleSpeedOffset = (100 + Random.random() * 400) * scaleCoef;
                                    birdInterval = Time.setInterval(() => {
                                      if (birdMaterialFlag) {
                                        obstacle.material = bird1Material;
                                        // obstacle.transform.y = (obstacle.transform.y.pinLastValue() + 5) * scaleCoef;
                                      } else {
                                        obstacle.material = bird2Material;
                                        // obstacle.transform.y = (obstacle.transform.y.pinLastValue() - 5) * scaleCoef;
                                      }
                                      birdMaterialFlag = !birdMaterialFlag;
                                    }, 300);      
                                    break;

                                  default:
                                    Diagnostics.log("Something is wrong.");
                                }
                                obstacle.width = obstacleSize.width;
                                obstacle.height = obstacleSize.height;
                                obstacle.transform.y = obstacleSize.y;                                              

                                const randomOffset = Random.random() * 500 * scaleCoef;
                                singleCactusSampler = Animation.samplers.linear(
                                  0.5 * canvasSize.width + obstacleSize.width + randomOffset,
                                  0.5 * canvasSize.width + obstacleSize.width - groundFrameWidth + randomOffset - obstacleSpeedOffset
                                );
                              } else {
                                singleCactusSampler = Animation.samplers.linear(
                                  obstacle.transform.x.pinLastValue(),
                                  obstacle.transform.x.pinLastValue() - groundFrameWidth - obstacleSpeedOffset
                                );
                              }
                              
                              const singleCactusAnimation = Animation.animate(obstacleCactusTimeDriver, singleCactusSampler);
                      
                              obstacle.transform.x = singleCactusAnimation;

                              obstacleCactusTimeDriver.start();
                              obstacleCactusTimeDriver.onCompleted().subscribe(() => {
                                generateObstacles();
                              });
                            }
                          }

                          const generateBump = () => {
                            if (isPlaying) {
                              bump1TimeDriver = Animation.timeDriver({
                                durationMilliseconds: frameDuration,
                                loopCount: 1,
                                mirror: false
                              })
                              let bump1Sampler = Animation.samplers.linear(1, -1);

                              if (bump.transform.x.pinLastValue() + bump.width.pinLastValue() * scaleCoef < -0.5 * canvas.width.pinLastValue()) {
                                const bumpKind = Math.round(Random.random() * 1);
                                switch (bumpKind) {
                                  case 0:
                                    bumpSize.width = 86 * scaleCoef;
                                    bumpSize.height = 12 * scaleCoef;
                                    bumpSize.y = -0.5 * canvasSize.height + groundSize.height + 6 * scaleCoef;
                                    bump.material = bump2Material;
                                    break;
                                      
                                  case 1:
                                    bumpSize.width = 91 * scaleCoef;
                                    bumpSize.height = 16 * scaleCoef;
                                    bumpSize.y = -0.5 * canvasSize.height + groundSize.height + 8 * scaleCoef;
                                    bump.material = bump1Material;
                                    break;

                                  default:
                                    Diagnostics.log("Something went wrong.");
                                }
                                bump.width = bumpSize.width;
                                bump.height = bumpSize.height;
                                bump.transform.y = bumpSize.y;

                                const randomOffset = Random.random() * 500 * scaleCoef;
                                let newX = 0.5 * canvasSize.width + bumpSize.width + randomOffset;
                                if (Math.abs(newX - obstacle.transform.x.pinLastValue()) < bumpSize.width) {
                                  newX += (Math.round(Random.random()) ? 1 : -1) * bumpSize.width;
                                }
                                bump1Sampler = Animation.samplers.linear(
                                  newX,
                                  0.5 * canvasSize.width + bumpSize.width - groundFrameWidth + randomOffset
                                );
                              } else {
                                bump1Sampler = Animation.samplers.linear(
                                  bump.transform.x.pinLastValue(),
                                  bump.transform.x.pinLastValue() - groundFrameWidth
                                );
                              }
                              
                              const bump1Animation = Animation.animate(bump1TimeDriver, bump1Sampler);
                              bump.transform.x = bump1Animation;
                              bump1TimeDriver.start();
                              
                              bump1TimeDriver.onCompleted().subscribe(() => {
                                generateBump();
                              });
                            }
                          }
                        });});
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

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

          Diagnostics.watch('cloud', cloud1.width.pinLastValue());
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


// To access class properties
// const directionalLightIntensity = directionalLight.intensity;