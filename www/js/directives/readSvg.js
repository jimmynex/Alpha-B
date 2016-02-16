app.directive('readSvg', function($state, $location, $timeout, $rootScope, $log)
{
	return {
		restrict: 'A',
		link: function ($scope, $element, $attrs)
		{
			var i=0;
			var formes_length = undefined;
			var points_length = undefined;
			var data_formes = undefined;
			var data_points = undefined;
			var last_control_points = {
				mode: "",
				x2: "",
				y2: ""
			}
			$scope.$on('write_svg', function(event, args)
			{
				$(document).ready(function(){
					$("svg").empty();
					$("svg").append(args);
					$("#cont").html($("#cont").html());
					$rootScope.$broadcast('read_svg');
				});
				//$element.html(args);
			});

			$scope.$on('read_svg', function(event, args)
			{
				$scope.$on('svg_load', function()
				{
					$scope.svg.visuels.formes = data_formes;
					$scope.svg.visuels.points = data_points;
					/*console.log("FORMES : ");
					console.log(formes);
					console.log("POINTS NOIRS ");
					console.log(points);*/
					//var debut = data[1].getAttribute('d');
					//var fin = data[2].getAttribute('d');
					//Index de lecture.

					$scope.svg.width = $attrs.width;
					$scope.svg.height = $attrs.height;

					$element.css('top', "-"+$attrs.height+"px");

					/*console.log("Données SVG : ");
					console.log(forme);
					console.log('****************');
					
					console.log('Compteur : ');
					compteur(forme);
					console.log('****************');

					console.log('Lecture des données : ');
					var traduction = traducteur(forme);
					console.log(traduction);
					console.log('****************');

					console.log('Reformation de la forme : ');
					$scope.svg.forme = formateur(traduction);
					console.log($scope.svg.forme);

					console.log('Lecture des points de tracés');
					i=0;
					$scope.svg.debut = cercle(traducteur(debut));
					i=0;
					$scope.svg.fin = cercle(traducteur(fin));

					console.log('******FIN*******');*/

					$scope.svg.formes = [];
					$scope.svg.points = [];

					for(var f in data_formes)
					{
						i = 0;
						$scope.svg.formes.push(formateur(traducteur(data_formes[f].getAttribute('d'))));
					}
					for(var p in data_points)
					{
						i = 0;
						$scope.svg.points.push(cercle(traducteur(data_points[p].getAttribute('d'))));
					}

					$rootScope.$broadcast('end_read_svg');
				});

				$('#svg').svg({onLoad: function(svg) { 
				        /*svg.rect(10, 20, 150, 100, {id: 'rect1', 
				            fill: 'red', stroke: 'black', strokeWidth: 3}); 
				        svg.circle(100, 150, 75, {id: 'circle1', 
				            fill: 'yellow', stroke: 'black', strokeWidth: 3}); 
				        var g = svg.group({transform: 'translate(200,20)'}); 
				        svg.circle(g, 100, 100, 75, {id: 'circle2', class_: 'grouped', 
				            fill: 'yellow', stroke: 'black', strokeWidth: 3}); 
				        svg.rect(g, 10, 150, 150, 100, {id: 'rect2', class_: 'grouped', 
				            fill: 'red', stroke: 'black', strokeWidth: 3}); 
				        resetSize(svg, '100%', '100%'); */

				        /*
				        console.log(svg._svg.childNodes[1].nodeName);
				        console.log(svg._svg.childNodes[1].childNodes[1].getAttribute('d'));*/

				        data_formes = [];
				        data_points = [];
				        var bool_formes = true;
				        for(var gvs in svg._svg.childNodes)
				        {
				        	if(svg._svg.childNodes[gvs].nodeName=="g")
				        	{
				        		for(var htap in svg._svg.childNodes[gvs].childNodes)
				        		{
				        			if(svg._svg.childNodes[gvs].childNodes[htap].nodeName=="path")
				        			{
				        				if(bool_formes)
				        					data_formes.push(svg._svg.childNodes[gvs].childNodes[htap]);
				        				else
				        					data_points.push(svg._svg.childNodes[gvs].childNodes[htap]);
				        			}
				        		}
				        		bool_formes = false;
				        	}
				        }
				        $rootScope.$broadcast('svg_load');
				    } 
				}); 
				/*$log.debug($('#svg').find('g')[0].children);
				formes_length = $('#svg').find('g')[0].children.length;
				//formes_length = $element.find('g')[0].children.length;
				points_length = $('#svg').find('g')[1].children.length;
				//points_length = $element.find('g')[1].children.length;
				data = $('#svg').find('g')[1].children.length;
				//data = $('#svg').find('g').find('path');*/
			});
			
			$rootScope.$broadcast('appli_loaded');

			function formateur(trad)
			{
				/* Doit ressembler à
				var forme = [{
					x: 0,
					y: 0
				},{
					x: 0,
					y: 0
				}];*/
				var forme = [];

				for(var e=0; e<trad.length; e++)//i already used, so e
				{
					if(trad[e].type=="function")
					{
						switch(trad[e].valeur)
						{
							case 'M': forme = M(forme, trad[e].params[0], trad[e].params[1], "absolute"); break;
							case 'm': forme = M(forme, trad[e].params[0], trad[e].params[1], "relative"); break;
							case 'Z': forme = Z(forme); break;
							case 'z': forme = Z(forme); break;
							case 'L': forme = L(forme, trad[e].params[0], trad[e].params[1], "absolute"); break;
							case 'l': forme = L(forme, trad[e].params[0], trad[e].params[1], "relative"); break;
							case 'H': forme = H(forme, trad[e].params[0], e, "absolute"); break;
							case 'h': forme = H(forme, trad[e].params[0], e, "relative"); break;
							case 'V': forme = V(forme, trad[e].params[0], e, "absolute"); break;
							case 'v': forme = V(forme, trad[e].params[0], e, "relative"); break;
							case 'C': forme = C(forme, trad[e].params[0], trad[e].params[1], trad[e].params[2], trad[e].params[3], trad[e].params[4], trad[e].params[5], "absolute"); break;
							case 'c': forme = C(forme, trad[e].params[0], trad[e].params[1], trad[e].params[2], trad[e].params[3], trad[e].params[4], trad[e].params[5], "relative"); break;
							case 'S': forme = S(forme, trad[e].params[0], trad[e].params[1], trad[e].params[2], trad[e].params[3], "absolute"); break;
							case 's': forme = S(forme, trad[e].params[0], trad[e].params[1], trad[e].params[2], trad[e].params[3], "relative"); break;
							case 'Q': console.log('Command '+trad[e].valeur+'not supported yet...'); break;
							case 'q': console.log('Command '+trad[e].valeur+'not supported yet...'); break;
							case 'T': console.log('Command '+trad[e].valeur+'not supported yet...'); break;
							case 't': console.log('Command '+trad[e].valeur+'not supported yet...'); break;
							case 'A': console.log('Command '+trad[e].valeur+'not supported yet...'); break;
							case 'a': console.log('Command '+trad[e].valeur+'not supported yet...'); break;
						}
					}
				}
				return forme;
			}

			/* moveto
			Move the pen to a new location. No line is drawn. All path data must begin with a 'moveto' command.
			*/
			function M(forme, x, y, mode)//ignore the mode, always absolute because x,y=0 at t0
			{
				forme.push({x: x, y: y});
				return forme;
			}

			/* lineto
			Draw a line from the current point to the point (x,y).
			*/
			function L(forme, x, y, mode)
			{
				var p_0 = {
					x: forme[forme.length-1].x,
					y: forme[forme.length-1].y,
					poids: 0};
				var p_z;

				if(mode=="absolute")
				{
					p_z = {x:x, y:y, poids: 0};
				}
				else if(mode=="relative")
				{
					p_z = {x: forme[forme.length-1].x+x, poids: 0, y: forme[forme.length-1].y+y};
				}
				for(var c = 0; c<=$rootScope.config.echantillonage_LHV; c++)
				{
					if(c!=0)
					{
						var t = c/($rootScope.config.echantillonage_LHV);
						p_0.poids = 1-t;
						p_z.poids = t;
						//puiss 1
						var m = barycentre(p_0, p_z);

						forme.push(m);
					}
				}				
				return forme;
			}

			/* horizontal lineto
			Draw a horizontal line from the current point to x.
			*/
			function H(forme, x, e, mode)
			{
				var p_0 = {
					x: forme[forme.length-1].x,
					y: forme[forme.length-1].y,
					poids: 0};
				var p_z;

				var y = forme[forme.length-1].y;
				if(mode=="absolute")
				{
					p_z = {x:x, y:y, poids: 0};
				}
				else if(mode=="relative")
				{
					p_z = {x: forme[forme.length-1].x+x, poids: 0, y: y};
				}
				for(var c = 0; c<=$rootScope.config.echantillonage_LHV; c++)
				{
					if(c!=0)
					{
						var t = c/($rootScope.config.echantillonage_LHV);
						p_0.poids = 1-t;
						p_z.poids = t;
						//puiss 1
						var m = barycentre(p_0, p_z);

						forme.push(m);
					}
				}				
				return forme;
			}

			/* vertical lineto
			Draw a horizontal line from the current point to y.
			*/
			function V(forme, y, e, mode)
			{
				var p_0 = {
					x: forme[forme.length-1].x,
					y: forme[forme.length-1].y,
					poids: 0};
				var p_z;

				var x = forme[forme.length-1].x;

				if(mode=="absolute")
				{
					p_z = {x:x, y:y, poids: 0};
				}
				else if(mode=="relative")
				{
					p_z = {x: x, y: forme[forme.length-1].y+y, poids: 0};
				}
				for(var c = 0; c<=$rootScope.config.echantillonage_LHV; c++)
				{
					if(c!=0)
					{
						var t = c/($rootScope.config.echantillonage_LHV);
						p_0.poids = 1-t;
						p_z.poids = t;
						//puiss 1
						var m = barycentre(p_0, p_z);

						forme.push(m);
					}
				}				
				return forme;
			}

			/* curveto
			Draw a cubic Bézier curve from the current point to the point (x,y) 
			using (x1,y1) as the control point at the beginning of the curve and
			 (x2,y2) as the control point at the end of the curve.
			*/
			function C(forme, x1, y1, x2, y2, x, y, mode)
			{
				last_control_points.mode = mode;

				var p_0 = {
					x: forme[forme.length-1].x,
					y: forme[forme.length-1].y,
					poids: 0};

				var p_c1, p_c2, p_z;

				if(mode=="absolute")
				{
					p_z = {x:x, y:y, poids: 0};
					p_c1 = {x:x1, y:y1, poids: 0};
					p_c2 = {x:x2, y:y2, poids: 0};

					last_control_points.x2 = x2+forme[forme.length-1].x;
					last_control_points.y2 = y2+forme[forme.length-1].y;
				}
				else if(mode=="relative")
				{
					p_z = {x: forme[forme.length-1].x+x,
						 y: forme[forme.length-1].y+y,
						 poids: 0};

					p_c1 = {x: forme[forme.length-1].x+x1,
						 y: forme[forme.length-1].y+y1,
						 poids: 0};

					p_c2 = {x: forme[forme.length-1].x+x2,
						 y: forme[forme.length-1].y+y2,
						 poids: 0};

					last_control_points.x2 = x2+forme[forme.length-1].x;
					last_control_points.y2 = y2+forme[forme.length-1].y;
				}

				/*console.log("p0");
				console.log(p_0);
				forme.push(p_0);*/

				for(var c = 0; c<=$rootScope.config.echantillonage_CS; c++)
				{
					if(c!=0)
					{
						var t = c/($rootScope.config.echantillonage_CS);
						/*p_0.poids = 1-t;
						p_z.poids = t;
						//puiss 1
						var m = barycentre(p_0, p_z);*/

						//puiss 3
						p_0.poids = 1-t;
						p_c1.poids = t;
						var m1 = barycentre(p_0, p_c1);

						p_c1.poids = 1-t;
						p_c2.poids = t;
						var m2 = barycentre(p_c1, p_c2);

						p_c2.poids = 1-t;
						p_z.poids = t;
						var m3 = barycentre(p_c2, p_z);

						m1.poids = 1-t;
						m2.poids = t;
						var n1 = barycentre(m1, m2);

						m2.poids = 1-t;
						m3.poids = t;
						var n2 = barycentre(m2, m3);

						n1.poids = 1-t;
						n2.poids = t;
						var m = barycentre(n1, n2);
						
						forme.push(m);
					}
				}
				
				return forme;
			}
			/*
			shorthand/smooth curveto
			Draw a cubic Bézier curve from the current point to (x,y). 
			The first control point is assumed to be the reflection of the last control point 
			on the previous command relative to the current point. 
			(x2,y2) is the second control point (i.e., the control point at the end of the curve)
			*/
			function S(forme, x2, y2, x, y, mode)
			{
				if(mode=="absolute")
				{
					var x1 = 2*forme[forme.length-1].x-last_control_points.x2;
					var y1 = 2*forme[forme.length-1].y-last_control_points.y2;
				}
				else if(mode=="relative")
				{
					var x1 = forme[forme.length-1].x-last_control_points.x2;
					var y1 = forme[forme.length-1].y-last_control_points.y2;
				}
				

				var p_0 = {
					x: forme[forme.length-1].x,
					y: forme[forme.length-1].y,
					poids: 0};

				var p_c1, p_c2, p_z;

				if(mode=="absolute")
				{
					p_z = {x:x, y:y, poids: 0};
					p_c1 = {x:x1, y:y1, poids: 0};
					p_c2 = {x:x2, y:y2, poids: 0};
				}
				else if(mode=="relative")
				{
					p_z = {x: forme[forme.length-1].x+x,
						 y: forme[forme.length-1].y+y,
						 poids: 0};

					p_c1 = {x: forme[forme.length-1].x+x1,
						 y: forme[forme.length-1].y+y1,
						 poids: 0};

					p_c2 = {x: forme[forme.length-1].x+x2,
						 y: forme[forme.length-1].y+y2,
						 poids: 0};
				}

				for(var c = 0; c<=$rootScope.config.echantillonage_CS; c++)
				{
					if(c!=0)
					{
						var t = c/($rootScope.config.echantillonage_CS);
						/*p_0.poids = 1-t;
						p_z.poids = t;
						//puiss 1
						var m = barycentre(p_0, p_z);*/

						//puiss 3
						p_0.poids = 1-t;
						p_c1.poids = t;
						var m1 = barycentre(p_0, p_c1);

						p_c1.poids = 1-t;
						p_c2.poids = t;
						var m2 = barycentre(p_c1, p_c2);

						p_c2.poids = 1-t;
						p_z.poids = t;
						var m3 = barycentre(p_c2, p_z);

						m1.poids = 1-t;
						m2.poids = t;
						var n1 = barycentre(m1, m2);

						m2.poids = 1-t;
						m3.poids = t;
						var n2 = barycentre(m2, m3);

						n1.poids = 1-t;
						n2.poids = t;
						var m = barycentre(n1, n2);

						forme.push(m);
					}
				}
				
				return forme;
			}

			/* closepath
			Closes the path. A line is drawn from the last point to the first point drawn.
			*/
			function Z(forme, mode)
			{
				forme.push(forme[0]);
				return forme;
			}

			function barycentre(p1, p2)
			{
				return {
					x: Math.abs(p2.poids*p2.x + p1.poids*p1.x),
					y: Math.abs(p2.poids*p2.y + p1.poids*p1.y)
				};
			}

			function traducteur(d)
			{
				var etapes = [];
				while(i<d.length)
				{
					if(i==0 && d[i]!='M'){ console.log('ERREUR... not starting with M'); break;}
					switch(d[i])
					{
						case 'M': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'M', params: params}); break;
						case 'm': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'm', params: params}); break;
						case 'Z': i++; etapes.push({ type: 'function', valeur: 'Z'}); break;
						case 'z': i++; etapes.push({ type: 'function', valeur: 'Z'}); break;
						case 'L': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'L', params: params}); break;
						case 'l': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'l', params: params}); break;
						case 'H': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'H', params: params}); break;
						case 'h': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'h', params: params}); break;
						case 'V': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'V', params: params}); break;
						case 'v': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'v', params: params}); break;
						case 'C': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'C', params: params}); break;
						case 'c': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'c', params: params}); break;
						case 'S': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'S', params: params}); break;
						case 's': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 's', params: params}); break;
						case 'Q': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'Q', params: params}); break;
						case 'q': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'q', params: params}); break;
						case 'T': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'T', params: params}); break;
						case 't': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 't', params: params}); break;
						case 'A': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'A', params: params}); break;
						case 'a': i++; var params = recursive(d, [], ""); etapes.push({ type: 'function', valeur: 'a', params: params}); break;
						case ' ': i++; break;
						default: console.log('ERROR..Not supposed to get a '+d[i]+' on line '+i+' between '+d[i-1]+' and '+d[i+1]+'. Verify your SVG file..');
					}
					i++;
				}
				return etapes;
			}

			function recursive(d, params, param)
			{
				switch(d[i])
				{
					case '0': param+=d[i]; i++; recursive(d, params, param); break;
					case '1': param+=d[i]; i++; recursive(d, params, param); break;
					case '2': param+=d[i]; i++; recursive(d, params, param); break;
					case '3': param+=d[i]; i++; recursive(d, params, param); break;
					case '4': param+=d[i]; i++; recursive(d, params, param); break;
					case '5': param+=d[i]; i++; recursive(d, params, param); break;
					case '6': param+=d[i]; i++; recursive(d, params, param); break;
					case '7': param+=d[i]; i++; recursive(d, params, param); break;
					case '8': param+=d[i]; i++; recursive(d, params, param); break;
					case '9': param+=d[i]; i++; recursive(d, params, param); break;
					case ',': params.push(parseFloat(param)); param=""; i++; recursive(d, params, param); break;
					case '-': if(param!="")params.push(parseFloat(param)); param=""; param+=d[i]; i++; recursive(d, params, param); break;
					case ' ': i++; recursive(d, params, param); break;
					case '.': param+=d[i]; i++; recursive(d, params, param); break;
					default: params.push(parseFloat(param)); i--; break;
				}
				return params;
			}

			function compteur(d)
			{
				var M = 0;
				var m = 0;
				var Z = 0;
				var z = 0;
				var L = 0;
				var l = 0;
				var H = 0;
				var h = 0;
				var V = 0;
				var v = 0;
				var C = 0;
				var c = 0;
				var S = 0;
				var s = 0;
				var Q = 0;
				var q = 0;
				var T = 0;
				var t = 0;
				var A = 0;
				var a = 0;
				for(var i=0; i<d.length; i++)
				{
					switch(d[i])
					{
						case 'M': M++; break;
						case 'm': m++; break;
						case 'Z': Z++; break;
						case 'z': z++; break;
						case 'L': L++; break;
						case 'l': l++; break;
						case 'H': H++; break;
						case 'h': h++; break;
						case 'V': V++; break;
						case 'v': v++; break;
						case 'C': C++; break;
						case 'c': c++; break;
						case 'S': S++; break;
						case 's': s++; break;
						case 'Q': Q++; break;
						case 'q': q++; break;
						case 'T': T++; break;
						case 't': t++; break;
						case 'A': A++; break;
						case 'a': a++; break;
					}
				}
				console.log('M:'+M);
				console.log('m:'+m);
				console.log('Z:'+Z);
				console.log('z:'+z);
				console.log('L:'+L);
				console.log('l:'+l);
				console.log('H:'+H);
				console.log('h:'+h);
				console.log('V:'+V);
				console.log('v:'+v);
				console.log('C:'+C);
				console.log('c:'+c);
				console.log('S:'+S);
				console.log('s:'+s);
				console.log('Q:'+Q);
				console.log('q:'+q);
				console.log('T:'+T);
				console.log('t:'+t);
				console.log('A:'+A);
				console.log('a:'+a);
			}

			function cercle(etapes)
			{
				var cercle = [];
				var rayon = $rootScope.config.rayon;
				var centre = {x: etapes[0].params[0]-3, y: etapes[0].params[1]-2};
				var precision = $rootScope.config.precision;


				for(var r=0; r<precision; r++)
				{
					cercle.push({x: centre.x+Math.cos(r*2*Math.PI/precision)*rayon, y: centre.y+Math.sin(r*2*Math.PI/precision)*rayon});
				}

				return cercle;
			}
		}
	};
});