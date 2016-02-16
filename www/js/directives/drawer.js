app.directive('drawer', function($state, $location, $timeout, $rootScope, $ionicGesture, $log, jsonExporter, biblioLettres, $firebaseArray)
{
	return {
		restrict: 'A',
		link: function ($scope, $element, $attrs)
		{
			//Initilisation variables
				var traces = [];
				var trace = [];
				var trace_fictif = [];
				var canvas;
				var ctx;
				var is_in_forme = false;
				var is_in_depart = false;
				var is_in_fin = false;
				var is_in_next_point = false;
				var is_in_rupture = false;
				var always_in_forme = true;

			//Variables usefull for exercices
				var indice_lettre = 0;
				var current_forme = 0;
				var current_point = 0;
				var current_visu_point = 0;
				var experiment_key = 0;
				var last_rupture_point = 0;
				var mode = $rootScope.config.user.experiment.exercice;
				var timer = false;
				$scope.$on('appli_loaded', function(event, args)
				{
					//Get a letter SVG image : biblioLettres.js
					var svg = biblioLettres.get($rootScope.config.user.experiment.exercice, $rootScope.config.user.experiment.scenario[indice_lettre]);
					//Then insert into the HTML : readSvg.js
					$rootScope.$broadcast('write_svg', svg);
				});

				if($rootScope.config.user.experiment.exercice == 0 || $rootScope.config.user.experiment.exercice == 1)
					$scope.svg.couleurs.background_erreur = $scope.svg.couleurs.background_cool;
				if(mode == 0)
					$scope.svg.couleurs.trace_en_cours = $scope.svg.couleurs.trace_faites;

			//Debug colors
				var forme_color = "black";
				var project_color = "rgb(180, 30, 30)";
			$element.parent().css("background-color", $scope.svg.couleurs.background_cool);
				
			/**
			* This event is called when readSvg.js did successfully read the
			* SVG letter. It attach Drag and Raised events on the canvas.
			*/
			$scope.$on('end_read_svg', function(event, args)
			{
				canvas = document.createElement('canvas');
				canvas.setAttribute('width', $scope.svg.width);
				canvas.setAttribute('height', $scope.svg.height);
				canvas.setAttribute('id', 'drawer');
				$element.empty();
				$element.append(canvas);
				if(typeof G_vmlCanvasManager != 'undefined') {
					canvas = G_vmlCanvasManager.initElement(canvas);
				}
				ctx = canvas.getContext("2d");

				var el = $('#drawer');
				var top = el.position().top;
				var left = el.position().left;

				redraw();

				/**
				* This function add a point and redraw the canvas
				*/
				$scope.onDrag = function(event)
				{
					//console.log(event);
					var x = event.center.x - left;
					var y = event.center.y - top - 120;

					var obj = {
						x: x,
						y: y
					};
					addPoint(obj);
					redraw();
				}

				//Sandbox timer
				if(mode==0)
				{
					timer = false;
					$timeout(function()
					{
						timer = true;
					}, 10000);
				}

				/**
				* When the finger is raised from the screen, test the situation. 
				* 3 Cases : 
				*	- Finger raised on the last point in the letter
				*	- Finger raised on a break point in the letter
				*	- Finger raised anywhere else, cancel the current tracing
				*/
				$scope.onRaised = function()
				{
					var echantillon_trace = trace.slice(trace.length-1, trace.length);

					if($scope.svg.visuels.points[current_point].getAttribute('class')=="rupture")
						is_in_rupture = isSubsume(echantillon_trace, $scope.svg.points[current_point], true);

					if(current_point==$scope.svg.points.length-1)
						is_in_fin = isSubsume(echantillon_trace, $scope.svg.points[$scope.svg.points.length-1], true);

					if(mode==0)
					{
						traces.push(trace);
					}

					if((is_in_depart && always_in_forme && is_in_fin) || mode==0 && timer==true || (mode==1 && is_in_depart && is_in_fin))//Fin de la lettre
					{
						traces.push(trace);
						if($rootScope.config.replay)
							$rootScope.config.replay = false;
						else if($rootScope.config.work_with_firebase)
							prepareToSave();

						indice_lettre++;
						if(indice_lettre<$rootScope.config.user.experiment.scenario.length)//Encore dans le scénario
						{
							current_forme++;
							current_point = 0;
							current_visu_point = 0;
							traces.push(trace);//On garde le tracé dans tracés
							trace = [];
							is_in_depart = false;//Reset avancement logique
							always_in_forme = true;
							is_in_fin = false;
							is_in_next_point = false;
							is_in_rupture = false;
							timer = false;
							redraw();
							var svg = biblioLettres.get($rootScope.config.user.experiment.exercice, $rootScope.config.user.experiment.scenario[indice_lettre]);
							$timeout(function()
							{
								$scope.svg.formes = [];
								$scope.svg.visuels = {};
								$scope.svg.visuels.formes = [];
								$scope.svg.visuels.points = [];
								$scope.svg.points = [];
								trace_fictif = [];
								traces = [];
								current_point = 0;
								current_visu_point = 0;
								current_forme = 0;
								last_rupture_point = 0;
								$rootScope.$broadcast('write_svg', svg);
								redraw();
							}, 1200);
						}
						else // Fin du scénario
						{
							current_forme++;
							traces.push(trace);//On garde le tracé dans tracés
							trace = [];
							is_in_depart = false;
							always_in_forme = true;
							is_in_fin = false;
							is_in_next_point = false;
							is_in_rupture = false;
							last_rupture_point = 0;
							redraw();
							$timeout(function()
							{
								$scope.svg.formes = [];
								$scope.svg.visuels = {};
								$scope.svg.visuels.formes = [];
								$scope.svg.visuels.points = [];
								$scope.svg.points = [];
								trace_fictif = [];
								traces = [];
								current_point = 0;
								current_visu_point = 0;
								current_forme = 0;
								last_rupture_point = 0;
								$scope.svg.couleurs.background_erreur = "#ff9900";
								$state.transitionTo("exos");
							}, 1200);
						}
					}
					else if(is_in_depart && always_in_forme && is_in_rupture || (mode==1 && is_in_depart && is_in_rupture))//Rupture dans une lettre, changement de forme
					{
						if(current_forme!=$scope.svg.visuels.formes.length-1)
						{
							current_forme++;
							current_point++;
						}
						else 
							current_point++;
						current_visu_point = current_point;
						last_rupture_point = current_point;
						traces.push(trace);//On garde le tracé dans tracés
						trace = [];
						is_in_depart = false;//Reset avancement logique
						always_in_forme = true;
						is_in_fin = false;
						is_in_next_point = false;
						is_in_rupture = false;
						redraw();
					}
					else //laché trop tot..
					{
						current_point = last_rupture_point;//Reset position
						current_visu_point = current_point;
						trace = [];
						$element.parent().css("background-color", $scope.svg.couleurs.background_cool);
						always_in_forme = true;
						is_in_fin = false;
						is_in_next_point = false;
						is_in_rupture = false;
						redraw();
					}									
				}

				//$rootScope.broadcast('replay_loaded', $rootScope.config.user.experiment.essais[$rootScope.config.indice_replay]);
			});

			/**
			* Save the tracings from traces[] to firebase.
			* Called when the letter is correctly done.
			*/
			function prepareToSave()
			{
				var t = new Date().getTime();
				var save = {
					user: $rootScope.config.user.nom,
					experiment: {
						exercice: $rootScope.config.user.experiment.exercice,
						scenario: $rootScope.config.user.experiment.scenario
						},
					essais: {
						lettre : $rootScope.config.user.experiment.scenario[indice_lettre],
						date: t,
						traces: traces
					}
				};
				if(indice_lettre==0)
				{
					$rootScope.config.user.key = 0;
					angular.forEach($scope.users, function(obj, ref)
					{
						if(obj.user == $rootScope.config.user.nom)
							$rootScope.config.user.key = obj.$id;
					});

	     			if($rootScope.config.user.key==0)
	     			{
	     				$scope.users.$add({user: save.user})
	     				.then(function(ref) {
	     					$rootScope.config.user.key = ref.key();
						  	var temp_ref = $firebaseArray(ref.child('experiment'));
	     					temp_ref.$add(save.experiment)
	     					.then(function(ref) {
							  	experiment_key = ref.key();
							  	var temp_ref = $firebaseArray(ref.child('essais'));
	     						temp_ref.$add(save.essais);
							});
						});
	     			}
	     			else
	     			{
	     				var temp_ref = $firebaseArray($scope.refs.usersRef.child($rootScope.config.user.key).child('experiment'));
	     				temp_ref.$add(save.experiment)
	     				.then(function(ref) {
						  	experiment_key = ref.key();
						  	var temp_ref = $firebaseArray(ref.child('essais'));
     						temp_ref.$add(save.essais);
						});
	     			}
				}
				else
				{
					var temp_ref = $firebaseArray($scope.refs.usersRef.child($rootScope.config.user.key).child('experiment').child(experiment_key).child('essais'));
					temp_ref.$add(save.essais);
				}
			}

			function addPoint(point)
			{
				var t = new Date().getTime();
				trace.push({x:point.x, y:point.y, time:t});
				exercice();
			}

			/**
			* Called at each new point, test the situation and set the booleans which are concerned
			*/
			function exercice()
			{
				is_in_forme = false;
				is_in_next_point = false;
				var echantillon_trace = trace.slice(trace.length-1, trace.length);

				is_in_forme = isSubsume(echantillon_trace, $scope.svg.formes[current_forme], false);
				always_in_forme = (is_in_forme && always_in_forme);

				if(trace.length==1)
					is_in_depart = isSubsume(echantillon_trace, $scope.svg.points[current_point], true);
				else
					is_in_next_point = isSubsume(echantillon_trace, $scope.svg.points[current_point], true);

				if(is_in_next_point || (trace.length==1 && is_in_depart))
					if($scope.svg.visuels.points[current_point].getAttribute('class')!="rupture")
						current_point++;
				if(current_point-1!=current_visu_point && is_in_depart)
					current_visu_point++;

				if(!always_in_forme || !is_in_depart)
					$element.parent().css("background-color", $scope.svg.couleurs.background_erreur);
				else
					$element.parent().css("background-color", $scope.svg.couleurs.background_cool);
			}

			/**
			* Clear the canvas 
			*/
			function clear()
			{
				//ctx.clearRect(0, 0, $scope.svg.width, $scope.svg.height);
				ctx.canvas.width = ctx.canvas.width;//reset affichage :O
				//fin clear
			}

			/**
			* 
			*/
			function opacity()
			{
				for(var f in $scope.svg.visuels.formes)
				{
					if(mode!=0)
					{
						if(current_forme==f)
							$scope.svg.visuels.formes[f].setAttribute('fill', "rgba(255,255,255,1)");
						else if(current_forme+1==f)
							$scope.svg.visuels.formes[f].setAttribute('fill', "rgba(255,255,255,0.6)");
						else if(current_forme+2==f)
							$scope.svg.visuels.formes[f].setAttribute('fill', "rgba(255,255,255,0.4)");
						else if(current_forme > f)
							$scope.svg.visuels.formes[f].setAttribute('fill', "rgba(255,255,255,0)");
						else 
							$scope.svg.visuels.formes[f].setAttribute('fill', "rgba(255,255,255,0.2)");
					}
					else
						$scope.svg.visuels.formes[f].setAttribute('fill', "rgba(255,255,255, 1)");
				}

				for(var p in $scope.svg.visuels.points)
				{
					if(current_visu_point == p && current_forme<$scope.svg.visuels.formes.length && mode!=0)
					{
						var hex = hexToRgb($scope.svg.couleurs.trace_en_cours);
						$scope.svg.visuels.points[p].setAttribute('fill', "rgba("+hex.r+","+hex.g+","+hex.b+",1)");
					}
					else if(current_visu_point+1 == p && /*mode == "Plusieurs Points" */ mode != 0
						&& $scope.svg.visuels.points[p-1].getAttribute('class')!="rupture" && current_forme<$scope.svg.visuels.formes.length && mode!=0)
					{
						var hex = hexToRgb($scope.svg.couleurs.trace_faites);
						$scope.svg.visuels.points[p].setAttribute('fill', "rgba("+hex.r+","+hex.g+","+hex.b+",1)");
					}
					else 
					{
						$scope.svg.visuels.points[p].setAttribute('fill', "rgba(0,0,0,0)");
					}
				}
			}

			function hexToRgb(hex) {
			    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			    return result ? {
			        r: parseInt(result[1], 16),
			        g: parseInt(result[2], 16),
			        b: parseInt(result[3], 16)
			    } : null;
			}

			function redraw()
			{
				clear();
				opacity();
				var radius = 12;
                ctx.lineCap="round";
				ctx.strokeStyle = $scope.svg.couleurs.trace_en_cours;
				ctx.lineJoin = "round";
				ctx.lineWidth = radius;
				
				//Construction du tracé à la main	
					ctx.beginPath();
					for(var i=0; i < trace.length; i++)
					{		
						if(i!=0)
						{
							ctx.moveTo(trace[i-1].x, trace[i-1].y);
							ctx.lineTo(trace[i].x, trace[i].y);
						}					
					}
					ctx.stroke();
					ctx.closePath();
					ctx.strokeStyle = $scope.svg.couleurs.trace_faites;
					for(var t = 0; t< traces.length; t++)	
					{
						ctx.beginPath();
						for(var i=0; i < traces[t].length; i++)
						{		
							if(i!=0)
							{
								ctx.moveTo(traces[t][i-1].x, traces[t][i-1].y);
								ctx.lineTo(traces[t][i].x, traces[t][i].y);
							}					
						}
						ctx.stroke();
						ctx.closePath();
					}
				//Construction de la forme SVG importée
				if($scope.$parent.debug)
				{
					var zero_x = 0;
					var zero_y = 0;
					ctx.strokeStyle = forme_color;
					ctx.lineJoin = "round";
					ctx.lineWidth = 3;							
					
					for(var f in $scope.svg.formes)
					{
						ctx.beginPath();
						for(var i=0; i < $scope.svg.formes[f].length; i++)
						{
							if(i==0)
							{
								zero_x = $scope.svg.formes[f][i].x;
								zero_y = $scope.svg.formes[f][i].y;
							}
							else
							{
								ctx.moveTo(zero_x, zero_y);
								//console.log('x: '+zero_x+' to '+newVal[i].x+' -- y:'+zero_y+' to '+newVal[i].y);
								ctx.lineTo($scope.svg.formes[f][i].x, $scope.svg.formes[f][i].y);
								//ctx.fillRect($scope.svg.forme[i].x,$scope.svg.forme[i].y, 2, 2);
								zero_x = $scope.svg.formes[f][i].x;
								zero_y = $scope.svg.formes[f][i].y;
							}
						}
						ctx.stroke();
						ctx.closePath();
					}
				}

				//Affichage des points projectées du tracés sur la forme
					if($scope.$parent.debug)
					{
						ctx.fillStyle = 'orange';
						ctx.lineJoin = "round";
						ctx.lineWidth = radius-1;
						ctx.beginPath();
						for(var i=0; i < trace_fictif.length; i++)
						{
							ctx.moveTo(trace_fictif[i].x, trace_fictif[i].y);
							ctx.fillRect(trace_fictif[i].x,trace_fictif[i].y, 4, 4);		
						}
						ctx.stroke();
						ctx.closePath();
					}

				//Affichage des points autour de chaque points
					if($scope.$parent.debug)
					{
						ctx.fillStyle = 'black';
						ctx.lineJoin = "round";
						ctx.lineWidth = radius-1;
						for(var p in $scope.svg.points)
						{
							ctx.beginPath();
							for(var i=0; i < $scope.svg.points[p].length; i++)
							{
								ctx.moveTo($scope.svg.points[p][i].x, $scope.svg.points[p][i].y);
								ctx.fillRect($scope.svg.points[p][i].x,$scope.svg.points[p][i].y, 2, 2);		
							}
							ctx.stroke();
							ctx.closePath();
						}						
					}
			}

			function isSubsume(sub, sur, pessimiste)
			{
				trace_fictif = [];
				var max_width = parseFloat($scope.svg.width);
				var max_height = parseFloat($scope.svg.height);

				for(var point in sub)
				{
					var isSubsumeBoolNord = true;
					var isSubsumeBoolEst = true;
					var isSubsumeBoolSud = true;
					var isSubsumeBoolOuest = true;

					var est = 0;
					var sud = 0;
					var ouest = 0;
					var nord = 0;

					//Est
					var sub_0 = sub[point];
					var sub_projete = {x: max_width, y:sub_0.y};

					if(sur!=undefined)
					{
						for(var i=0; i<sur.length; i++)
						{
							if(i!=sur.length-1)
								var p = getLineIntersection(sub_0.x,sub_0.y, sub_projete.x, sub_projete.y, sur[i].x, sur[i].y, sur[i+1].x, sur[i+1].y);
							else 
								var p = getLineIntersection(sub_0.x,sub_0.y, sub_projete.x, sub_projete.y, sur[i].x, sur[i].y, sur[0].x, sur[0].y);
							if(p!=null)
							{
								trace_fictif.push(p);
								est++;
							}
						}
						if(est%2==0)
							isSubsumeBoolEst = false;
						if(!isSubsumeBoolEst || pessimiste)//Si le test de subsomption vers la droite ne marche pas. On test le sud
						{
							//Sud
							sub_projete = {x: sub_0.x, y:max_height};
							for(var i=0; i<sur.length; i++)
							{
								if(i!=sur.length-1)
								var p = getLineIntersection(sub_0.x,sub_0.y, sub_projete.x, sub_projete.y, sur[i].x, sur[i].y, sur[i+1].x, sur[i+1].y);
							else 
								var p = getLineIntersection(sub_0.x,sub_0.y, sub_projete.x, sub_projete.y, sur[i].x, sur[i].y, sur[0].x, sur[0].y);
								if(p!=null)
								{
									trace_fictif.push(p);
									sud++;
								}
							}
							if(sud%2==0)
								isSubsumeBoolSud = false;
							if(!isSubsumeBoolSud || pessimiste)//Si le test de subsomption vers la droite ne marche pas. On test le sud
							{
								//Ouest
								sub_projete = {x: 0, y:sub_0.y};
								for(var i=0; i<sur.length; i++)
								{
									if(i!=sur.length-1)
								var p = getLineIntersection(sub_0.x,sub_0.y, sub_projete.x, sub_projete.y, sur[i].x, sur[i].y, sur[i+1].x, sur[i+1].y);
							else 
								var p = getLineIntersection(sub_0.x,sub_0.y, sub_projete.x, sub_projete.y, sur[i].x, sur[i].y, sur[0].x, sur[0].y);
									if(p!=null)
									{
										trace_fictif.push(p);
										ouest++;
									}
								}
								if(ouest%2==0)
									isSubsumeBoolOuest = false;
								if(!isSubsumeBoolOuest || pessimiste)//Si le test de subsomption vers la droite ne marche pas. On test le sud
								{
									//Nord
									sub_projete = {x: sub_0.x, y:0};
									for(var i=0; i<sur.length; i++)
									{
										if(i!=sur.length-1)
								var p = getLineIntersection(sub_0.x,sub_0.y, sub_projete.x, sub_projete.y, sur[i].x, sur[i].y, sur[i+1].x, sur[i+1].y);
							else 
								var p = getLineIntersection(sub_0.x,sub_0.y, sub_projete.x, sub_projete.y, sur[i].x, sur[i].y, sur[0].x, sur[0].y);
										if(p!=null)
										{
											trace_fictif.push(p);
											nord++;
										}
									}
									if(nord%2==0)
										isSubsumeBoolNord = false;
									if(pessimiste)
									{
										var compteur = 0;
										if(!isSubsumeBoolNord)
											compteur++;
										if(!isSubsumeBoolOuest)
											compteur++;
										if(!isSubsumeBoolSud)
											compteur++;
										if(!isSubsumeBoolEst)
											compteur++
										if(compteur>=2)
											return false;
									}
									else if(!isSubsumeBoolNord)
									{
										return false;
									}
								}
							}
						}
					}
				}
				return true;			
			}

			function getLineIntersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) 
			{
				var s1_x, s1_y, s2_x, s2_y; 
				s1_x = p1_x - p0_x; 
				s1_y = p1_y - p0_y; 
				s2_x = p3_x - p2_x; 
				s2_y = p3_y - p2_y;
				var s, t; 
				s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y); 
				t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

				if (s >= 0 && s <= 1 && t >= 0 && t <= 1) 
				{ 
					// Collision detected 
					var intX = p0_x + (t * s1_x); 
					var intY = p0_y + (t * s1_y); 
					return {x:intX, y:intY};
				}
				return null;
				// No collision 
			}

			$scope.$on('replay_loaded', function(event, args)
			{
				$rootScope.config.replay = true;
				//replayTimer(args.data.traces[0][0], 100, args.data.traces, 0, 0);
			});
			function replayTimer(point, wait, traces, current_p, current_t)
			{
				if($rootScope.config.replay)
				{
					$timeout(function()
					{
						addPoint(point);
						redraw();
						current_p++;
						if(current_p!=traces[current_t].length)
							$rootScope.config.replayTimer(traces[current_t][current_p], traces[current_t][current_p].time-traces[current_t][current_p-1].time, traces, current_p, current_t);
						else
						{
							$scope.onRaised();
							if(current_t!=traces.length-1)current_t++;
							$rootScope.config.replayTimer(traces[current_t][0], 100, traces, 0, current_t);
						}
					}, wait);
				}
			}
		}
	};
});