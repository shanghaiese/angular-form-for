angular.module('formForDocumentation').directive('prism',
  function($compile, $http) {
    return {
      restrict: 'EA',
      link: function($scope, $element, $attributes) {
        var parser = $attributes.hasOwnProperty('parser') ? $attributes['parser'] : 'markup';

        var highlight = function(text) {
          var html = Prism.highlight(text, Prism.languages[parser]);

          $element.html('<pre class="language-' + parser + '"><code>' + html + '</code></pre>');
        };

        var showError = function() {
          $element.html('<p class="alert alert-danger"><i class="fa fa-times"></i> The specified template could not be loaded.</p>');
        };

        if ($attributes.source) {
          $element.html('<i class="fa fa-spin fa-spinner"></i> Loading...');

          $http({method: 'GET', url: $attributes.source}).
            success(
              function(data) {
                if (data) {
                  highlight(data);
                } else {
                  showError();
                }
              }).
            error(showError);
        } else {
          highlight($element.html());
        }
      }
    };
});

angular.module('formForDocumentation').directive('disableFieldButton', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/templates/disable-field-button.html',
    scope: {
      isDisabled: '='
    }
  };
});

angular.module('formForDocumentation').directive('validateFieldButton', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/templates/validate-field-button.html',
    scope: {
      fieldName: '@',
      formController: '='
    },
    controller: function($scope) {
      $scope.validateField = function() {
        $scope.formController.validateField($scope.fieldName, true);
      };
    }
  };
});

angular.module('formForDocumentation').directive('resetFieldButton', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/templates/reset-field-button.html',
    scope: {
      fieldName: '@',
      formController: '='
    },
    controller: function($scope) {
      $scope.resetField = function() {
        $scope.formController.resetField($scope.fieldName);
      };
    }
  };
});

angular.module('formForDocumentation').value('currentTemplates', {
  key: 'bootstrap'
});

angular.module('formForDocumentation').directive('templateToggler', function($ocLazyLoad, $state, $stateParams, currentTemplates) {
  var map = {};
  map['default'] = ['formFor.defaultTemplates', 'http://rawgit.com/bvaughn/angular-form-for/1.3.1/dist//form-for.default-templates.js'];
  map['bootstrap'] = ['formFor.bootstrapTemplates', 'http://rawgit.com/bvaughn/angular-form-for/1.3.1/dist//form-for.bootstrap-templates.js'];

  return {
    restrict: 'E',
    templateUrl: 'app/templates/template-toggler.html',
    scope: {
    },
    link: function($scope) {
      $scope.current = currentTemplates.key;

      $scope.load = function(key) {
        $scope.current = currentTemplates.key = key;

        var module = map[key][0];
        var url = map[key][1];

        var modules = $ocLazyLoad.getModules();
        var index = modules.indexOf(module);

        if (index >= 0) {
          modules.splice(index, 1);
        }

        $ocLazyLoad.load({
          name: module,
          cache: false,
          files: [url]
        }).then(function() {
          $state.go($state.current, $stateParams, {reload: true});
        });

        return false;
      }
    }
  };
});