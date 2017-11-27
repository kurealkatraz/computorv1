var globalBs = 0;
const chalk		= require('chalk');
const args		= process.argv;
const context	= args.slice(2);

function alertLog(str) {
	console.log(chalk.bgRed(chalk.white('[ERR] ' + str)));
}

function warnLog(str) {
	console.log(chalk.bgYellow(chalk.black('[WRN] ' + str)));
}

function succLog(str) {
	console.log(chalk.bgGreen(chalk.white('[SUC]' + str)));
}

function blob(exp) {
	this.exp			= exp;
	this.clusterList	= [];
	this.xTimes			= 0;
	this.add			= 0;
	this.stepHolder		= [];
	this.valid			= true;
	this.multiply		= function(i) {
		var indexA	= i;
		var indexB	= i + 1;
		var a		= this.clusterList[indexA];
		var b		= this.clusterList[indexB];
		var merged	= {
			'sign'	: a.sign,
			'value'	: null,
			'isX'	: a.isX || b.isX,
			'pow'	: null
		};

		if (a.isX && b.isX && a.pow === 1 && b.pow === 1)
			merged.pow = 2;
		if (a.pow === 1 || b.pow === 1)
		{
			merged.value = a.value * b.value;
			if (a.pow + b.pow === 3)
				merged.pow = 2;
			else if (a.pow + b.pow < 2)
			{
				merged.pow = 1;
				alertLog("Power multipliying");
			}
			else
				merged.pow = a.pow > b.pow ? a.pow : b.pow;
		}
		return (merged);
	}
	this.divide = function(i) {
		var indexA	= i;
		var indexB	= i + 1;
		var a		= this.clusterList[indexA];
		var b		= this.clusterList[indexB];
		var merged	= {
			'sign'	: a.sign,
			'value'	: null,
			'isX'	: a.isX || b.isX,
			'pow'	: null
		};

		if (a.isX && b.isX && a.pow === 1 && b.pow === 1)
			merged.pow = 2;
		if (a.pow === 1 || b.pow === 1)
		{
			merged.value = a.value / b.value;
			if (a.pow + b.pow === 3)
				merged.pow = 2;
			else if (a.pow + b.pow < 2)
			{
				merged.pow = 1;
				alertLog("Power dividing");
			}
			else
				merged.pow = a.pow > b.pow ? a.pow : b.pow;
		}
		return (merged);
	}
	this.subOrAdd		= function(i) {
		var indexA	= i;
		var indexB	= i + 1;
		var a		= this.clusterList[indexA];
		var b		= this.clusterList[indexB];
		var merged	= {
			'sign'	: a.sign,
			'value'	: null,
			'isX'	: a.isX || b.isX,
			'pow'	: a.pow
		};

		if (a.isX && b.isX && a.pow === b.pow)
			merged.value = a.sign === '-' ? -a.value : a.value + b.sign === '-' ? -b.value : b.value;
		else if (!a.isX && !b.isX)
			merged.value = Math.pow(a.sign === '-' ? -a.value : a.value) + Math.pow(b.sign === '-' ? -b.value : b.value);
		if (merged.value)
			return (merged);
		else
			return (null);
	}
	this.calcLinear		= function() {
		var archiveClusterList	= this.clusterList.slice(0);
		var newCluster			= [];
		var i					= 0;
		var newBlob				= {};

		while (i < this.clusterList.length)
		{
			newBlob = {};
			if (this.clusterList[i + 1] && this.clusterList[i + 1].sign.match(/[\+\-]/gi) !== null)
			{
				newBlob = this.subOrAdd(i++);
				if (newBlob)
				{
					newCluster.push(newBlob);
					this.clusterList = newCluster.concat(this.clusterList.slice(i + 1));
					this.stepHolder.push(archiveClusterList);
					this.calcLinear();
				}
				else
					newCluster.push(this.clusterList[i]);
			}
			else
				newCluster.push(this.clusterList[i]);
			i++;
		}
	}
	this.calcNonLinear	= function() {
		var archiveClusterList	= this.clusterList.slice(0);
		var newCluster			= [];
		var i					= 0;
		var changeApplied		= false;

		while (i < this.clusterList.length)
		{
			changeApplied = false;
			if (this.clusterList[i + 1] && this.clusterList[i + 1].sign === '*')
			{
				newCluster.push(this.multiply(i++));
				changeApplied = true;
			}
			else if (this.clusterList[i + 1] && this.clusterList[i + 1].sign === '/')
			{
				newCluster.push(this.divide(i++));
				changeApplied = true;
			}
			else
				newCluster.push(this.clusterList[i]);
			if (changeApplied === true)
			{
				this.clusterList = newCluster.concat(this.clusterList.slice(i + 1));
				this.stepHolder.push(archiveClusterList);
				this.calcNonLinear();
			}
			i++;
		}
	}
	this.logClusters	= function(clusterList) {
		var formatedExpression = '';

		if (!clusterList)
			clusterList = this.clusterList;
		for (var s = 0; s < clusterList.length; s++)
		{
			if (s === 0 && clusterList[s].sign.match(/\-\/\*/) !== null)
				formatedExpression += clusterList[s].sign + ' ';
			else if (s !== 0)
				formatedExpression += clusterList[s].sign + ' ';
			if (clusterList[s].pow == 0)
			{
				formatedExpression = 1 + ' ';
				continue ;
			}
			formatedExpression += clusterList[s].value
			if (clusterList[s].isX)
				formatedExpression += 'x';
			if (clusterList[s].pow > 1)
				formatedExpression += '^' + clusterList[s].pow + ' '
			else
				formatedExpression += ' ';
		}
		return (formatedExpression.trim());
	}
	this.clusterGen	= function() {
		for (var s = this.getNextCluster(0); s < this.exp.length; s++)
		{
			if (this.exp[s].match(/[\+\-\*\/]/gi) !== null)
			{
				var ret = this.getNextCluster(s);

				s = ret - 1;
				if (s === null)
					break ;
			}
		}
	}
	this.getNextCluster = function(index) {
		var indexCluster	= this.clusterList.length;
		var counting		= true;
		var countingPower	= true;
		var endIndex		= 0;
		var retObj			= {
			'value'	: 0,
			'pow'	: 1,
			'sign'	: this.exp[index].match(/[\+\-\*\/]/gi) !== null ? this.exp[index] : '+',
			'isX'	: false
		}

		if (this.exp[index].match(/[\*\/]/gi) !== null && index === 0)
		{
			alertLog('Unexpected token at collumn ' + index);
			this.valid = false;
			return (this.exp.length);
		}
		if (this.exp[index].match(/[\-\+\/\*]/gi) !== null)
			index++;
		for (var s = index; s < this.exp.length; s++)
		{
			if (this.exp[s].match(/[0-9\.]/) !== null)
			{
				var decimals = false;
				var height = 10;

				if (counting === false)
				{
					alertLog('Unexpected token at collumn ' + s);
					this.valid = false;
					return (this.exp.length);
				}
				for (var i = s; i < this.exp.length; i++)
				{
					if (this.exp[i].match(/[0-9]/) !== null)
					{
						if (!decimals)
						{
							retObj.value = (retObj.value * 10) + Number(this.exp[i])
						}
						else
						{
							retObj.value += Number(this.exp[i]) / height;
							height *= 10;
						}
					}
					else if (this.exp[i] === '.')
						decimals = true;
					else
					{
						s = i - 1;
						break;
					}
				}
				counting = false;
			}
			else if (this.exp[s].match(/[\+\-\*\/]/gi) !== null)
			{
				if (counting === true && retObj.isX === false)
				{
					alertLog('Unexpected token at collumn ' + s);
					this.valid = false;
					return (this.exp.length);
				}
				this.clusterList.push(retObj);
				return (s);
			}
			else if (this.exp[s].match(/x/gi) !== null)
			{
				if (retObj.isX === true)
				{
					alertLog('Unexpected token at collumn ' + s);
					this.valid = false;
					return (this.exp.length);
				}
				retObj.isX = true;
			}
			else if (this.exp[s] === '^')
			{
				var pValue = 0;

				if (countingPower === false)
				{
					alertLog('Unexpected token at collumn ' + s);
					this.valid = false;
					return (this.exp.length);					
				}
				for (var i = s + 1; i < this.exp.length; i++)
				{
					if (this.exp[i].match(/[0-9]/) !== null)
						pValue = (pValue * 10) + Number(this.exp[i]);
					else
					{
						if (i === s)
						{
							alertLog('Unexpected token at collumn ' + s);
							this.valid = false;
							return (this.exp.length);
						}
						s = i;
						break ;
					}
				}
				retObj.pow = pValue;
				countingPower = false;
			}
		}
		this.clusterList.push(retObj)
	}
	this.clusterGen();
}

function solver(expression) {
	if (typeof expression !== 'string')
		alertLog("No valid expression has been handed to me :(");
	this.expression = expression.trim();
	this.reducedForm = null;
	this.discriminant = null;
	this.stepHolder = [];
	this.leftHand = null;
	this.rightHand = null;
	this.checkExpression = function() {
		const	acceptableCharReg	= new RegExp(/[0-9xX\s\+\-\*\/.\=\^]/gi);
		var		hasLeftHand			= false;
		var		hasRightHand		= false;
		var		hasEqual			= false;

		for (var s = 0; s < this.expression.length; s++)
		{
			if (this.expression[s].match(acceptableCharReg) === null)
			{
				alertLog("expression '" + expression + "' contains an unsupported character at collumn " + s);
				return (s);
			}
			if (!hasEqual && expression[s].match(/[0-9]/))
				hasLeftHand = true;
			if (this.expression[s] === '=')
			{
				if (hasEqual)
				{
					alertLog("expression has multiple equal signs !");
					return (0);
				}
				hasEqual = true;
			}
			if (hasEqual && hasLeftHand && this.expression[s].match(/[0-9]/) !== null)
				hasRightHand = true;
		}
		if (!hasEqual || !hasRightHand)
		{
			warnLog('No equal sign or no Right hand operation, assuming is equal to 0');
			this.expression += ' = 0'
		}
		if (!hasLeftHand)
		{
			alertLog('Missing Left Hand operation');
			return (0);
		}
		else
			return (-1);
	}
	this.simplify = function() {
		this.leftHand.calcNonLinear();
		this.rightHand.calcNonLinear();
		console.log(this.leftHand.logClusters())
		console.log(this.rightHand.logClusters())
		this.leftHand.calcLinear();
		this.rightHand.calcLinear();
	}
	this.genClusters = function() {
		var leftHandExp = (this.expression.split('='))[0];
		var rigthHandExp = (this.expression.split('='))[1];
		var fullEquation;

		this.leftHand = new blob(leftHandExp);
		this.rightHand = new blob(rigthHandExp);
		if (this.leftHand.valid !== true || this.rightHand.valid !== true)
			return (null);
	}
	return (this);
}

for (var s = 0; s < context.length; s++)
{
	var eq = new solver(context[s]);

	if (eq.checkExpression() !== -1)
		continue ;
	if (eq.genClusters() === null)
		continue ;
	if (eq.simplify() === null)
		continue ;
	console.log(eq.leftHand.logClusters());
	console.log(eq.rightHand.logClusters());
}
