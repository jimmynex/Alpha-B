app.controller('mainCtrl', function($scope, $rootScope, $state, jsonExporter, $firebaseArray, $firebaseObject) 
{
   //Init parameters
   $scope.svg = {};
   $scope.svg.width = 600;
   $scope.svg.height = 600;
   $scope.svg.bc = "rgb(150, 150, 220)";
   $scope.svg.formes = [];
   $scope.svg.visuels = {};
   $scope.svg.visuels.formes = [];
   $scope.svg.visuels.points = [];
   $scope.svg.points = [];
   $scope.svg.couleurs = {};
   $scope.svg.couleurs.background_cool = "#FFFFFF";

   $scope.debug = false;
   $rootScope.config = {};
   $rootScope.config.user  = {};
   $rootScope.config.user.key = 0;
   $rootScope.config.security = false;
   $rootScope.config.replay = false;
   $rootScope.config.indice_replay = 0;
   $rootScope.config.user.nom = "";
   $rootScope.config.user.experiment = {};
   $rootScope.config.user.experiment.exercice = undefined;
   $rootScope.config.user.experiment.scenario = undefined;
   $rootScope.config.user.experiment.traces = [];

   $rootScope.config.work_with_firebase = false;

   //Nomber of points for sampling the outline of the letter
      $rootScope.config.echantillonage_CS = 10;
      $rootScope.config.echantillonage_LHV = 10;
   //Radius (in px) of each dot into the letters
      $rootScope.config.rayon = 28;
   //Nomber of points for sampling the outline of the circles
      $rootScope.config.precision = 8;

   //Colors
      var verticales = "#3300cc";
      var horizontales = "#ff0053";
      var rondes = "#19dc74";
      var obliques = "#9966ff";
      var erreurs = "#ff9900";

   //References to Firebase data
   if($rootScope.config.work_with_firebase)
   {
      $scope.refs = {};
      $scope.refs.myDataRef = new Firebase('https://alphab.firebaseio.com/');

      //Users ref : 
      $scope.refs.usersRef = $scope.refs.myDataRef.child('users');
      $scope.users = $firebaseArray($scope.refs.usersRef);

      $scope.users.$loaded().then(function(data)
      {
         //This code currently loads all users. 
         //It may be improved by loading only the user concerned.
         //This session is linked to drawer.js : prepareToSave() function.
      }).catch(function(error) 
      {
         console.log("Error while loading users:", error);
      });
   }
   


   //Navigation functions
      $scope.liste = function()
      {
         $scope.svg.couleurs.background_cool = "#FFFFFF";
         $state.transitionTo("replay");
      }
      $scope.replay = function(expe)
      {
         //If you want to implement replay functionnality :
            //Look at the end of drawer.js file : $scope.on('replay_loaded') and replayTimer function
         /*
         console.log(expe);
         $rootScope.config.security = true;
         $rootScope.config.replay = true;
         $rootScope.config.user.experiment.exercice = expe.exercice;
         $rootScope.config.user.experiment.scenario = expe.scenario;
         $rootScope.config.user.experiment.essais = expe.essais;
         */
         alert("Bientôt prêt");
         //$state.transitionTo("work");
      }
      $scope.menu = function()
      {
         if($rootScope.config.user.nom == "")//The user name musn't be empty
         {
            alert("Vous devez renseigner votre nom.");
         }
         else
         {
            $scope.svg.couleurs.background_cool = "#FFFFFF";
            $state.transitionTo("menu");
         }      
      }
      $scope.scenario = function(scenar)
      {
         //Reset variables : preparation to relaunch an exercice
            $rootScope.config.user.experiment.scenario = scenar;
            $scope.svg.formes = [];
            $scope.svg.visuels = {};
            $scope.svg.visuels.formes = [];
            $scope.svg.visuels.points = [];
            $scope.svg.couleurs = {};
            $scope.svg.points = [];
         //Design configuration function of the scenario
            if($rootScope.config.user.experiment.scenario == "LTZHFAE")//Horizontales
            {
               $scope.svg.couleurs.background_cool = horizontales;
               $scope.svg.couleurs.trace_en_cours = horizontales;
               $scope.svg.couleurs.trace_faites = verticales;
               $scope.svg.couleurs.background_erreur = erreurs;

               $scope.svg.couleurs.interface_horizontale = "#FFFFFF";
               $scope.svg.couleurs.interface_verticale = verticales;
               $scope.svg.couleurs.interface_ronde = rondes;
               $scope.svg.couleurs.interface_oblique = obliques;
            }
            else if($rootScope.config.user.experiment.scenario == "JUCOSGDPQBR")//Rondes
            {
               $scope.svg.couleurs.background_cool = rondes;
               $scope.svg.couleurs.trace_en_cours = rondes;
               $scope.svg.couleurs.trace_faites = horizontales;
               $scope.svg.couleurs.background_erreur = erreurs;

               $scope.svg.couleurs.interface_horizontale = horizontales;
               $scope.svg.couleurs.interface_verticale = verticales;
               $scope.svg.couleurs.interface_ronde = "#FFFFFF";
               $scope.svg.couleurs.interface_oblique = obliques;
            }
            else if($rootScope.config.user.experiment.scenario == "VQZXNRWYMA")//Obliques
            {
               $scope.svg.couleurs.background_cool = obliques;
               $scope.svg.couleurs.trace_en_cours = obliques;
               $scope.svg.couleurs.trace_faites = rondes;
               $scope.svg.couleurs.background_erreur = erreurs;

               $scope.svg.couleurs.interface_horizontale = horizontales;
               $scope.svg.couleurs.interface_verticale = verticales;
               $scope.svg.couleurs.interface_ronde = rondes;
               $scope.svg.couleurs.interface_oblique = "#FFFFFF";
            }
            else//Verticales
            {
               $scope.svg.couleurs.background_cool = verticales;
               $scope.svg.couleurs.trace_en_cours = verticales;
               $scope.svg.couleurs.trace_faites = obliques;
               $scope.svg.couleurs.background_erreur = erreurs;

               $scope.svg.couleurs.interface_horizontale = horizontales;
               $scope.svg.couleurs.interface_verticale = "#FFFFFF";
               $scope.svg.couleurs.interface_ronde = rondes;
               $scope.svg.couleurs.interface_oblique = obliques;
            }
         $state.transitionTo("exos");
      }
      $scope.exercice = function(exo)
      {
         $scope.config.security = true;
         $rootScope.config.user.experiment.exercice = exo;
         $state.transitionTo("work");
      }
      $scope.backName = function()
      {
         $state.transitionTo("name");
         //
      }
      $scope.backMenu = function()
      {
         $scope.svg.couleurs.background_cool = "#ffffff";
         $state.transitionTo("menu");
      }

   /**
   * WARNING : THIS METHOD TOTALLY SET EMPTY THE FIREBASE.
   * This method can be called in name.html with the button "Vider la base".
   * This button is currently hidden by security.
   */
   $scope.viderLaBase = function()
   {
      $scope.refs.myDataRefRemove = $firebaseObject($scope.refs.myDataRef);
      $scope.refs.myDataRefRemove.$remove().then(function(ref) {
        console.log('data has been deleted locally and in Firebase');
      }, function(error) {
        console.log("Error removing:", error);
      });
   }

   /**
   * This function detects states changements. 
   * It stops the navigation and redirect the user if there is a problem.
   */
   $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) 
   {
      //If the 'work' view is called, but not from $scope.exercice()
      if(toState.name=="work" && !$scope.config.security)
      {
         event.preventDefault();
         $state.transitionTo("name");
      }
      //If the 'menu' view is called but the user is unknown
      else if(toState.name=="menu" && $scope.config.user.nom=="")
      {
         event.preventDefault();
         $state.transitionTo("name");
      }
      //If the 'exos' view is called but the user is unknown
      else if(toState.name=="exos" && $scope.config.user.nom=="")
      {
         event.preventDefault();
         $state.transitionTo("name");
      }
      //Always reactivate security
      $scope.config.security = false;
   });
});