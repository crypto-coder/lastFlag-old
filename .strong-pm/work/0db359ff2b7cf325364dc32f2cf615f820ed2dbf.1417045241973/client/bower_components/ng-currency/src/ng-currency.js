/*
 * ng-currency
 * http://alaguirre.com/

 * Version: 0.7.5 - 2014-07-15
 * License: MIT
 *
 *
 *
 .directive('currencyMax', function(){
 return { controller: function($scope){} }
 })
 .directive('currencySymbol', function(){
 return { controller: function($scope){} }
 })
 .directive('currencyNod', function(){
 return { controller: function($scope){} }
 })
 */

angular.module('ng-currency', [])
    .directive('ngCurrency', function ($filter, $locale) {
        return {
            require: 'ngModel',
            scope: {
                min: '=',
                max: '=',
                symbol: '=',
                numberOfDecimals: '=nod',
                ngRequired: '=ngRequired'
            },
            link: function (scope, element, attrs, ngModel) {

                function decimalRex(dChar) {
                    return RegExp("\\d|\\" + dChar, 'g')
                }

                function clearRex(dChar) {
                    return RegExp("((\\" + dChar + ")|([0-9]{1,}\\" + dChar + "?))&?[0-9]{0,10}", 'g');
                }

                function decimalSepRex(dChar) {
                    return RegExp("\\" + dChar, "g")
                }

                function clearValue(value) {
                    value = String(value);
                    var dSeparator = $locale.NUMBER_FORMATS.DECIMAL_SEP;
                    var clear = null;

                    if (value.match(decimalSepRex(dSeparator))) {
                        clear = value.match(decimalRex(dSeparator))
                            .join("").match(clearRex(dSeparator));
                        clear = clear ? clear[0].replace(dSeparator, ".") : null;
                    }
                    else if (value.match(decimalSepRex("."))) {
                        clear = value.match(decimalRex("."))
                            .join("").match(clearRex("."));
                        clear = clear ? clear[0] : null;
                    }
                    else {
                        clear = value.match(/\d/g);
                        clear = clear ? clear.join("") : null;
                    }

                    return clear;
                }

                ngModel.$parsers.push(function (viewValue) {
                    cVal = clearValue(viewValue);
                    return parseFloat(cVal);
                });

                element.on("blur", function () {
                    if(scope.symbol) {
                        if(isNaN(scope.numberOfDecimals)){
                            element.val($filter('currency')(ngModel.$modelValue, scope.symbol));
                        }else{
                            element.val($filter('currency')(ngModel.$modelValue, scope.symbol, parseInt(scope.numberOfDecimals)));
                        }
                    }else{
                        element.val($filter('currency')(ngModel.$modelValue));
                    }
                });

                ngModel.$formatters.unshift(function (value) {
                    if(scope.symbol) {
                        if(isNaN(scope.numberOfDecimals)){
                            return $filter('currency')(value, scope.symbol);
                        }else{
                            return $filter('currency')(value, scope.symbol, parseInt(scope.numberOfDecimals));
                        }
                    }else{
                        return $filter('currency')(value);
                    }
                });

                scope.$watch(function () {
                    return ngModel.$modelValue
                }, function (newValue, oldValue) {
                    runValidations(newValue)
                })

                function runValidations(cVal) {
                    if (!scope.ngRequired && isNaN(cVal)) {
                        return
                    }
                    if (scope.min) {
                        var min = parseFloat(scope.min)
                        ngModel.$setValidity('min', cVal >= min)
                    }
                    if (scope.max) {
                        var max = parseFloat(scope.max)
                        ngModel.$setValidity('max', cVal <= max)
                    }
                }
            }
        }
    });

