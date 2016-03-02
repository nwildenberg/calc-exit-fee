var myApp = angular.module('myApp', []);

function date2yearfirst(s)
{
	s = s + "0000000000";
	return s.substr(6,4) + "-" + s.substr(3,2) + "-" + s.substr(0,2);
}

function date2yearlast(s)
{
	s = s + "0000000000";
	return s.substr(6,2) + "-" + s.substr(3,2) + "-" + s.substr(0,4); 
}

function IsNaN(c)
{
	return('0123456789'.indexOf(c) >= 0);
}
function FormatCurrency(number)
{
	var numberStr = parseFloat(number).toFixed(2).toString();
	var numFormatDec = numberStr.slice(-2); /*decimal 00*/
	numberStr = numberStr.substring(0, numberStr.length-3); /*cut last 3 strings*/
	var numFormat = new Array;
	while (numberStr.length > 3) {
		numFormat.unshift(numberStr.slice(-3));
		numberStr = numberStr.substring(0, numberStr.length-3);
	}
	numFormat.unshift(numberStr);
	return numFormat.join('.')+','+numFormatDec; /*format 000.000.000,00 */
}

function DateOnKeyPress(event, element) {
	var v = element.value;
	if( v == "dd-mm-jjjj" ) {
		element.value = "";
		//element.select();
	}
	if( v.length == 2 ) {
		element.value = v + '-';
		//element.select();
	}
	if( v.length == 5 ) {
		element.value = v + '-';
		//element.select();
	}
	if( event.keyCode == 45 )
	{
		if( v.length == 1 )
		{
			element.value = '0' + v + '-';
		}
		if( v.length == 4 )
		{
			element.value = v.substr(0,3) + '0' + v.substr(3,3) + '-';
		}
	}

	return !((event.keyCode < 48) || (event.keyCode > 57) || (element.value.length > 9));
}

function NumberOnKeyPress(event, element) {
	var v = element.value;
	return !((event.keyCode < 48) || (event.keyCode > 57) || (element.value.length > 6));
}

function CurrencyOnKeyPress(event, element) {
	var v = element.value;
	var retVal = false;
	
	// komma
	if ( event.keyCode == 44 )
	{
		retVal = ( v.indexOf(',') == -1 );
	}

	// cijfers
	if ( event.keyCode >= 48 && event.keyCode <= 57 )
	{
		var a = v.indexOf(',');
		retVal = ( a == -1 ) || ( (a > -1) && ( (v.length - 2) <= a ) );
	}

	return retVal;
}
/**
 * isValidDate(str)
 * @param string str value yyyy-mm-dd
 * @return boolean true or false
 * IF date is valid return true
 */
function isValidDate(str){
	// STRING FORMAT yyyy-mm-dd
	if(str=="" || str==null){return false;}								
	
	// m[1] is year 'YYYY' * m[2] is month 'MM' * m[3] is day 'DD'					
	var m = str.match(/(\d{4})-(\d{2})-(\d{2})/);
	
	// STR IS NOT FIT m IS NOT OBJECT
	if( m === null || typeof m !== 'object'){return false;}				
	
	// CHECK m TYPE
	if (typeof m !== 'object' && m !== null && m.size!==3){return false;}
				
	var ret = true; //RETURN VALUE						
	var thisYear = new Date().getFullYear() + 10; //YEAR NOW
	var minYear = 1800; //MIN YEAR
	
	// YEAR CHECK
	if( (m[1].length < 4) || m[1] < minYear || m[1] > thisYear){ret = false;}
	// MONTH CHECK          
    if( (m[2].length < 2) || m[2] < 1 || m[2] > 12) {ret = false;}
    // DAY CHECK
    if( (m[3].length < 2) || m[3] < 1 || m[3] > 31) {ret = false;}

	return ret;			
}

function DotForComma(s)
{
	if (typeof s !== 'undefined') {
		return s.toString().replace( /,/ig, "." );
	}
	else
	{
		return s;
	}
}

function IsNotAllowed(keyCode)
{
	console.log(keyCode);
//	result = ('0123456789'.indexOf(String.fromCharCode(keyCode)) >= 0);
	return (keyCode > 57);
}

myApp.controller('ctrlCalcForm', ['$scope', '$http', '$window', function($scope, $http, window) {
	$scope.BooleanOptions = [{name:'ja', value:'ja'}, {name:'nee', value:'nee'}];

	$scope.NeedToCalculate = true;
	$scope.Message = "Met onderstaande calculator kunt u uitrekenen wat de minimale vergoeding is voor ontslag.";
	$scope.Name = "Niels";
	$scope.PaymentsPerYear = 12;
	$scope.SalaryPerPayment = 3000;
	$scope.HolidayPerc = 8;
	$scope.Fixed13thMonth = 0;
	$scope.FixedOvertime = 0;
	$scope.FixedShift = 0;
	$scope.ExtraBonus = 0;
	$scope.CalculatedFee = 0;
	$scope.BirthDate = "dd-mm-jjjj";
	$scope.DateIn = "dd-mm-jjjj";
	$scope.DateOut = "dd-mm-jjjj";
	$scope.MoreThan25 = $scope.BooleanOptions[0]; //ja

	$scope.evalDateKey = function($event) {
		//var c = String.fromCharCode($event.keyCode);
		if ( IsNotAllowed($event.keyCode) ) {
			alert('not a number');
			return false;
		}
	}

	$scope.doCalc = function() {
		// calculate salaris
		resBirthDate = date2yearfirst($scope.BirthDate);
		resDateIn = date2yearfirst($scope.DateIn);
		resDateOut = date2yearfirst($scope.DateOut);

		if ( !isValidDate( resBirthDate ) )
		{
			alert("Geboorte datum is onjuist ingevuld.");
			document.CalcForm.BirthDate.focus();
			return false;
		}

		if ( !isValidDate( resDateIn ) )
		{
			alert("Datum in dienst is onjuist ingevuld.");
			document.CalcForm.DateIn.focus();
			return false;
		}

		if ( !isValidDate( resDateOut ) )
		{
			alert("Datum uit dienst is onjuist ingevuld.");
			document.CalcForm.DateOut.focus();
			return false;
		}

		$http.post('/docalc', {	PaymentsPerYear:parseInt($scope.PaymentsPerYear), 
								SalaryPerPayment:parseFloat(DotForComma($scope.SalaryPerPayment)),
								HolidayPerc:parseInt($scope.HolidayPerc), 
								Fixed13thMonth:parseFloat(DotForComma($scope.Fixed13thMonth)),
								FixedOvertime:parseFloat(DotForComma($scope.FixedOvertime)), 
								FixedShift:parseFloat(DotForComma($scope.FixedShift)),
								ExtraBonus:parseFloat(DotForComma($scope.ExtraBonus)),
								MoreThan25:($scope.MoreThan25.name == 'ja' ? true : false),
								BirthDate:$scope.BirthDate,
								DateIn:$scope.DateIn,
								DateOut:$scope.DateOut						
		}).success(function(data, status, headers, config) {
			$scope.CalculatedFee = data[0];
			$scope.CalculatedFeeFormatted = FormatCurrency(data[0]);
			$scope.CalculatedKantonFee = data[1];
			$scope.CalculatedKantonFeeFormatted = FormatCurrency(data[1]);
			$scope.NeedToCalculate = false;
		});
	};
}]);
