app.directive('bg', function () 
{
    return {
        restrict: 'A',
        link: function ($scope, $element, $attrs)
        {
            $scope.$watch('svg.couleurs.background_cool', function()
            {
                $element.parent().css("background-color", $scope.svg.couleurs.background_cool);
            })
        }
    };
});