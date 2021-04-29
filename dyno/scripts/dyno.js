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

const Scene = require('Scene');
const Reactive = require('Reactive');
const Animation = require('Animation');
const Materials = require('Materials');
const Time = require('Time');
const Random = require('Random');
const TouchGestures = require('TouchGestures');
const FaceTracking = require('FaceTracking');
const FaceGestures = require('FaceGestures');
const CameraInfo = require('CameraInfo');

const face = FaceTracking.face(0);
const groundHeight = 190;
let dynoSize = { width: 0, height: 0, x: 0, y: 0 },
canvasSize = { width: 0, height: 0, x: 0, y: 0 },
groundSize = { width: 0, height: 0, x: 0, y: 0 },
groundLinesSize = { width: 0, height: 0, x: 0, y: 0 },
obstacleSize = { width: 0, height: 0, x: 0, y: 0 },
objectSize = { width: 0, height: 0, x: 0, y: 0 },
object1Size = { width: 0, height: 0, x: 0, y: 0 },
object2Size = { width: 0, height: 0, x: 0, y: 0 },
object3Size = { width: 0, height: 0, x: 0, y: 0 },
object4Size = { width: 0, height: 0, x: 0, y: 0 },
horizonSize = { width: 0, height: 0, x: 0, y: 0 },
bumpSize = { width: 0, height: 0, x: 0, y: 0 };

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
const slowestGameDuration = 1500, fastestGameDuration = 1500;
let gameDuration = slowestGameDuration;
let frameDuration = gameDuration / groundFramesCount;

Materials.findFirst('dyno_default').then(dynoDefaultMaterial => {
  Materials.findFirst('dyno_1').then(dyno1Material => {
    Materials.findFirst('dyno_2').then(dyno2Material => {
      Materials.findFirst('dyno_final').then(dynoFinalMaterial => {
        Materials.findFirst('bird_1').then(bird1Material => {
          Materials.findFirst('bird_2').then(bird2Material => {
            Scene.root.findFirst('canvas').then(canvas => {
              Scene.root.findFirst('dyno').then(dyno => {
                Scene.root.findFirst('ground').then(ground => {
                  Scene.root.findFirst('ground_lines').then(groundLines => {
                    Scene.root.findFirst('obstacle_1').then(obstacle1 => {
                      Scene.root.findFirst('obstacle_2').then(obstacle2 => {
                        Scene.root.findFirst('obstacle_3').then(obstacle3 => {
                          Scene.root.findFirst('obstacle_4').then(obstacle4 => {
                            Scene.root.findFirst('horizon').then(horizon => {
                              Scene.root.findFirst('game_over').then(gameOverText => {
                                Scene.root.findFirst('game_over_outlined').then(gameOverOutlinedText => {
                                  Scene.root.findFirst('score').then(scoreText => {
                                    Scene.root.findFirst('score_outlined').then(scoreOutlinedText => {
                                      Scene.root.findFirst('bump').then(bump => {
                                        Scene.root.findFirst('meter-lb').then(meterLB => {
                                          Scene.root.findFirst('meter-rb').then(meterRB => {

                                            // Size and location presets
                                            canvasSize.width = canvas.width.pinLastValue();
                                            canvasSize.height = canvas.height.pinLastValue();

                                            const scaleCoef = canvasSize.width / 370;

                                            const meterLBX = meterLB.transform.x.pinLastValue();
                                            const meterRBX = meterRB.transform.x.pinLastValue();

                                            groundSize.width = ground.width.pinLastValue();
                                            groundSize.height = ground.height.pinLastValue();
                                            groundSize.y = ground.transform.y.pinLastValue();
                                            
                                            groundLinesSize.width = 1024 * scaleCoef;
                                            groundLinesSize.height = 20 * scaleCoef;
                                            groundLinesSize.y = -0.5 * canvasSize.height + groundSize.height - 0.5 * groundLinesSize.height - 5 * scaleCoef;
                                            groundLines.transform.x = groundLinesSize.x;

                                            dynoSize.width = 96 * scaleCoef;
                                            dynoSize.height = 102  * scaleCoef;
                                            dynoSize.y = -0.5 * canvasSize.height + groundSize.height + 31 * scaleCoef;
                                            dynoSize.x = -0.5 * canvasSize.width + 0.5 * dynoSize.width + 20 * scaleCoef;

                                            horizonSize.width = canvasSize.width;
                                            horizonSize.height = 4 * scaleCoef;
                                            horizonSize.y = -0.5 * canvasSize.height + groundSize.height + 0.5 * horizonSize.height;

                                            obstacleSize.width = 100;
                                            obstacleSize.height = 100;
                                            obstacleSize.y = obstacle1.transform.y.pinLastValue();
                                            obstacleSize.x = obstacle1.transform.x.pinLastValue();

                                            object1Size.width = obstacle1.width.pinLastValue();
                                            object1Size.height = obstacle1.height.pinLastValue();

                                            object2Size.width = obstacle2.width.pinLastValue();
                                            object2Size.height = obstacle2.height.pinLastValue();

                                            object3Size.width = obstacle3.width.pinLastValue();
                                            object3Size.height = obstacle3.height.pinLastValue();
                                            
                                            object4Size.width = obstacle4.width.pinLastValue();
                                            object4Size.height = obstacle4.height.pinLastValue();
                                            object4Size.y = obstacle4.transform.y.pinLastValue();

                                            obstacle1.transform.x = meterLBX - 100;
                                            obstacle2.transform.x = meterLBX - 100;
                                            obstacle3.transform.x = meterLBX - 100;
                                            obstacle4.transform.x = meterLBX - 100;
                                            obstacle4.transform.y = obstacleSize.y;

                                            objectSize = object1Size;

                                            bumpSize.width = 100;
                                            bumpSize.height = 100;
                                            bumpSize.y = -0.5 * canvasSize.height + groundSize.height + 31 * scaleCoef;
                                            bumpSize.x = -canvasSize.width;

                                            const groundFrameWidth = groundLinesSize.width / groundFramesCount;

                                            let object = obstacle1;

                                            const makeTypoInGameOver = () => {
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
                                              Time.setTimeout(makeTypoInGameOver, 2000 + Random.random() * 5000);
                                            }

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
                                              obstacle1.transform.x = meterLBX - 100;
                                              obstacle2.transform.x = meterLBX - 100;
                                              obstacle3.transform.x = meterLBX - 100;
                                              obstacle4.transform.x = meterLBX - 100;
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
                                                  const freq = 500;
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
                                              dyno.material = dynoFinalMaterial;
                                              
                                              gameOverInterval = Time.setTimeout(makeTypoInGameOver, 600);
                                            }

                                            const updateGameDuration = () => {
                                              if (isPlaying) {
                                                gameDuration = slowestGameDuration * (1-Math.pow(timeIterator, 2)) + fastestGameDuration;
                                                timeIterator += 0.1;
                                                frameDuration = gameDuration / groundFramesCount
                                                Time.setTimeout(updateGameDuration, 1000);
                                              }
                                            };

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
                                                );
                                                const dynoJumpAnimation = Animation.animate(firstDynoJumpDriver, dynoJumpSampler);
                                                dyno.transform.y = dynoJumpAnimation;

                                                firstDynoJumpDriver.start();
                                                firstDynoJumpDriver.onCompleted().subscribe(() => {
                                                  const backDown = () => {
                                                    if (isPlaying) {
                                                      secondDynoJumpDriver = Animation.timeDriver({
                                                        durationMilliseconds: gameDuration / 3,
                                                        loopCount: 1,
                                                        mirror: true
                                                      });
                                    
                                                      const dynoJumpSampler = Animation.samplers.easeInQuart(
                                                        dynoSize.y + 140,
                                                        dynoSize.y
                                                      );
                                                      const dynoJumpAnimation = Animation.animate(secondDynoJumpDriver, dynoJumpSampler);
                                                      dyno.transform.y = dynoJumpAnimation;
                                    
                                                      secondDynoJumpDriver.start();
                                                      secondDynoJumpDriver.onCompleted().subscribe(() => {
                                                        if (isPlaying) {
                                                          dyno.transform.y = dynoSize.y;
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
                                              jump();
                                            });
                                            FaceGestures.hasRightEyeClosed(face, {threshold: 0.5, backlash: 0.1}).monitor().subscribe(() => {
                                              jump();
                                            });
                                            TouchGestures.onTap().subscribe(() => {
                                              if (!isPlaying && firstGameStart) {
                                                runGame();
                                              }
                                              jump();
                                            });
                                            CameraInfo.isRecordingVideo.monitor().subscribe(() => {
                                              if (!isPlaying) {
                                                runGame();
                                              }
                                            });

                                            const dynoXBorder = 0.5 * dynoSize.width - 20 * scaleCoef,
                                                  dynoYBorder = 0.5 * dynoSize.height - 20 * scaleCoef;
                                            const checkGameOver = () => {
                                              if (dyno.transform.x.pinLastValue() + dynoXBorder > object.transform.x.pinLastValue() - 0.5 * objectSize.width
                                              && dyno.transform.x.pinLastValue() - dynoXBorder < object.transform.x.pinLastValue() + 0.5 * objectSize.width
                                              && dyno.transform.y.pinLastValue() - dynoYBorder < object.transform.y.pinLastValue() + 0.5 * objectSize.height
                                              && dyno.transform.y.pinLastValue() + dynoYBorder > object.transform.y.pinLastValue() - 0.5 * objectSize.height
                                              ) {
                                                stopGame();
                                              }
                                              if (isPlaying) {
                                                Time.setTimeout(checkGameOver, 40);
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

                                            const generateObstacles = () => {
                                              if (isPlaying) {
                                                obstacleCactusTimeDriver = Animation.timeDriver({
                                                  durationMilliseconds: frameDuration,
                                                  loopCount: 1,
                                                  mirror: false
                                                })
                                                let singleCactusSampler = Animation.samplers.linear(1, -1);
                                                if (object.transform.x.pinLastValue() + objectSize.width <= meterLBX - 20) {
                                                  Time.clearInterval(birdInterval);
                                                  obstacleSpeedOffset = 0;
                                                  const obstacleKind = Math.round(Random.random() * 1);
                                                  switch (obstacleKind) {
                                                    case 0:
                                                      const cactusKind = Math.round(Random.random() * 2);
                                                      switch (cactusKind) {
                                                        case 0:
                                                          object = obstacle1;
                                                          objectSize = object1Size;
                                                          break;

                                                        case 1:
                                                          object = obstacle2;
                                                          objectSize = object2Size;
                                                          break;

                                                        case 2:
                                                          object = obstacle3;
                                                          objectSize = object3Size;
                                                          break;
                                                      }
                                                      break;

                                                    case 1:
                                                      object = obstacle4;
                                                      objectSize = object4Size;
                                                      const newY = objectSize.y + (140 * Math.round(Random.random()));
                                                      obstacle4.transform.y = newY;
                                                      obstacleSpeedOffset = (10 + Random.random() * 50) * scaleCoef;
                                                      birdInterval = Time.setInterval(() => {
                                                        if (birdMaterialFlag) {
                                                          obstacle4.material = bird1Material;
                                                          birdMaterialFlag = false;
                                                        } else {
                                                          obstacle4.material = bird2Material;
                                                          birdMaterialFlag = true;
                                                        }
                                                        
                                                      }, 500);      
                                                      break;
                                                  }                                            

                                                  const randomOffset = Random.random() * (timeIterator * 200) * scaleCoef;
                                                  singleCactusSampler = Animation.samplers.linear(
                                                    meterRBX + randomOffset,
                                                    meterRBX + randomOffset - groundFrameWidth - obstacleSpeedOffset
                                                  );
                                                } else {
                                                  singleCactusSampler = Animation.samplers.linear(
                                                    object.transform.x.pinLastValue(),
                                                    object.transform.x.pinLastValue() - groundFrameWidth - obstacleSpeedOffset
                                                  );
                                                }
                                                
                                                const singleCactusAnimation = Animation.animate(obstacleCactusTimeDriver, singleCactusSampler);
                                        
                                                object.transform.x = singleCactusAnimation;

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

                                                if (bump.transform.x.pinLastValue() + bumpSize.width * scaleCoef < -0.5 * canvas.width.pinLastValue()) {

                                                  const randomOffset = Random.random() * 500 * scaleCoef;
                                                  let newX = meterRBX + randomOffset;
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