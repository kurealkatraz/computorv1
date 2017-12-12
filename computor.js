/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   computor.js                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mgras <mgras@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2017/11/29 21:07:29 by mgras             #+#    #+#             */
/*   Updated: 2017/12/12 12:22:49 by mgras            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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
	console.log(chalk.green('[SUC] ') + str);
}

function blob(exp) {
	this.exp			= exp;
	this.clusterList	= [];
	this.xTimes			= 0;
	this.add			= 0;
	this.stepHolderNL	= [];
	this.stepHolderL	= [];
	this.valid			= true;
	this.powAjust		= function(i) {
		if (!this.clusterList[i].isX && this.clusterList[i].pow > 0)
		{
			this.clusterList[i].value = Math.pow(this.clusterList[i].value, this.clusterList[i].pow);
			this.clusterList[i].pow = 1;
		}
	}
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

		merged.value = a.value * b.value;
		if (a.isX && b.isX)
		{
			merged.pow = a.pow + b.pow;
			if (merged.value === 0)
			{
				merged.pow = 1;
				merged.isX = false;
			}
		}
		else
			merged.pow = a.isX ? a.pow : b.pow;
		if (merged.value !== null)
			return (merged);
		else
			return (null);
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

		merged.value = a.value / b.value;
		if (a.isX && b.isX)
		{
			merged.pow = a.pow - b.pow;
			if (merged.value === 0)
			{
				merged.pow = 1;
				merged.isX = false;
			}
		}
		else if (b.isX)
			return (null);
		else
			merged.pow = a.isX ? a.pow : b.pow;
		if (merged.value !== null)
			return (merged);
		else
			return (null);
	}
	this.subOrAdd		= function(indexA, indexB) {
		var a		= this.clusterList[indexA];
		var b		= this.clusterList[indexB];
		var merged	= {
			'sign'	: null,
			'value'	: null,
			'isX'	: a.isX || b.isX,
			'pow'	: 1
		};

		if (this.clusterList[indexB + 1] && this.clusterList[indexB + 1].sign.match(/[\/\*]/) !== null)
			return (null);
		if (a.sign.match(/[\/\*]/gi) !== null || b.sign.match(/[\/\*]/gi) !== null)
			return (null);
		if (a.isX && b.isX && a.pow === b.pow)
		{
			merged.value = (a.sign === '-' ? -a.value : a.value) + (b.sign === '-' ? -b.value : b.value);
			if (merged.value === 0 && a.pow !== 0)
			{
				merged.pow = 1;
				merged.isX = false;
			}
			else
				merged.pow = a.pow
		}
		else if (!a.isX && !b.isX)
			merged.value = Math.pow(a.sign === '-' ? -a.value : a.value, a.pow) + Math.pow(b.sign === '-' ? -b.value : b.value, b.pow);
		merged.sign = merged.value >= 0 ? '+' : '-';
		if (merged.value !== null)
		{
			merged.value = Math.abs(merged.value);
			return (merged);
		}
		else
		{
			return (null);
		}
	}
	this.calcLinear		= function() {
		var archiveClusterList	= this.clusterList.slice(0);
		var newCluster			= [];
		var newBlob				= {};

		for (var i = 0; i < this.clusterList.length; i++)
		{
			for (var j = i + 1; j < this.clusterList.length; j++)
			{
				newBlob = this.subOrAdd(i, j);
				if (newBlob)
				{
					this.clusterList.splice(j, 1);
					this.clusterList[i] = newBlob;
					this.stepHolderL.push(archiveClusterList);
					succLog(eq.leftHand.logClusters() + ' = ' + eq.rightHand.logClusters())
					this.calcLinear();
					break ;
				}
			}
		}
	}
	this.calcNonLinear	= function() {
		var archiveClusterList	= this.clusterList.slice(0);
		var newCluster			= [];
		var newBlob				= null;
		var i					= 0;
		var changeApplied		= false;

		while (i < this.clusterList.length)
		{
			newBlob = null;
			if (this.clusterList[i + 1] && this.clusterList[i + 1].sign === '*')
				newBlob = this.multiply(i++);
			else if (this.clusterList[i + 1] && this.clusterList[i + 1].sign === '/')
				newBlob = this.divide(i++);
			else
				newCluster.push(this.clusterList[i]);
			if (newBlob !== null)
			{
				newCluster.push(newBlob);
				this.clusterList = newCluster.concat(this.clusterList.slice(i + 1));
				this.stepHolderNL.push(archiveClusterList);
				this.calcNonLinear();
				succLog(eq.leftHand.logClusters() + ' = ' + eq.rightHand.logClusters());
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
			if (s === 0 && clusterList[s].sign !== '+')
				formatedExpression += clusterList[s].sign;
			else if (s !== 0)
				formatedExpression += clusterList[s].sign  + ' ';
			formatedExpression += clusterList[s].value
			if (clusterList[s].isX)
				formatedExpression += 'x';
			if (clusterList[s].isX)
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
			'value'	: null,
			'pow'	: 1,
			'sign'	: this.exp[index].match(/[\+\-\*\/]/gi) !== null ? this.exp[index] : '+',
			'isX'	: false
		}

		this.exp = this.exp.trim();
		if (this.exp[index].match(/[\*\/]/gi) !== null && index === 0)
		{
			alertLog('00 Unexpected token at collumn ' + index);
			this.valid = false;
			return (this.exp.length);
		}
		if (this.exp[index].match(/[\-\+\/\*]/gi) !== null)
		{
			if (this.exp[index] === '-')
				retObj.sign = '-';
			index++;
		}
		for (var s = index; s < this.exp.length; s++)
		{
			if (this.exp[s].match(/[0-9\.]/) !== null)
			{
				var decimals = false;
				var height = 10;

				if (counting === false)
				{
					alertLog('01 Unexpected token at collumn ' + s);
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
						counting = false;
						break ;
					}
				}
				s = i - 1;
				counting = false;
			}
			else if (this.exp[s].match(/[\+\-\*\/]/gi) !== null)
			{
				if (counting === true && retObj.isX === false)
				{
					alertLog('02 Unexpected token at collumn ' + s);
					this.valid = false;
					return (this.exp.length);
				}
				this.clusterList.push(retObj);
				return (s);
			}
			else if (this.exp[s].match(/[xX]/gi) !== null)
			{
				if (retObj.isX === true)
				{
					alertLog('03 Unexpected token at collumn ' + s);
					this.valid = false;
					return (this.exp.length);
				}
				if (retObj.value === null)
					retObj.value = 1;
				retObj.isX = true;
			}
			else if (this.exp[s] === '^')
			{
				var pValue = 0;
				var isNeg = false;

				if (countingPower === false)
				{
					alertLog('04 Unexpected token at collumn ' + s);
					this.valid = false;
					return (this.exp.length);					
				}
				for (var i = s + 1; i < this.exp.length; i++)
				{
					if (this.exp[i].match(/[0-9]/) !== null)
						pValue = (pValue * 10) + Number(this.exp[i]);
					else if (this.exp[i] === '-')
						isNeg = true;
					else
					{
						retObj.pow = pValue;
						countingPower = false;
						s = i;
						if (!retObj.isX)
						{
							retObj.value = Math.pow(retObj.value, retObj.pow)
							retObj.pow = 1;
						}
						if (isNeg && retObj.isX)
						{
							this.clusterList.push({
								'value'	: retObj.value,
								'pow'	: 1,
								'sign'	: retObj.sign,
								'isX'	: false
							});
							this.clusterList.push({
								'value'	: 1,
								'pow'	: retObj.pow,
								'sign'	: '/',
								'isX'	: true
							});
						}
						else
							this.clusterList.push(retObj);
						return (s);
					}
				}
				s = i;
				retObj.pow = pValue;
				countingPower = false;
				if (!retObj.isX)
				{
					retObj.value = Math.pow(retObj.value, retObj.pow)
					retObj.pow = 1;
				}
				if (isNeg && retObj.isX)
				{
					this.clusterList.push({
						'value'	: retObj.value,
						'pow'	: 1,
						'sign'	: retObj.sign,
						'isX'	: false
					});
					this.clusterList.push({
						'value'	: 1,
						'pow'	: retObj.pow,
						'sign'	: '/',
						'isX'	: true
					});
				}
				else
					this.clusterList.push(retObj);
				return (s);
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
	this.stepHolderNL = [];
	this.stepHolderL = [];
	this.leftHand = null;
	this.rightHand = null;
	this.checkExpression = function() {
		const	acceptableCharReg	= new RegExp(/[0-9xX\s\+\-\*\/.\=\^ ]/gi);
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
		this.leftHand.calcLinear();
		this.rightHand.calcLinear();
	}
	this.genClusters = function() {
		var leftHandExp = (this.expression.split('='))[0];
		var rightHandExp = (this.expression.split('='))[1];
		var fullEquation;

		this.leftHand = new blob(leftHandExp);
		this.rightHand = new blob(rightHandExp);
		if (this.leftHand.valid !== true || this.rightHand.valid !== true)
			return (null);
	}
	this.getReducedForm = function() {
		var reverso = {'+' : '-', '-' : '+', '/' : '/', '*' : '*'};

		for (var i = 0; i < this.rightHand.clusterList.length; i++)
		{
			this.rightHand.clusterList[i].sign = reverso[this.rightHand.clusterList[i].sign];
			this.leftHand.clusterList.push(this.rightHand.clusterList[i]);
		}
		this.rightHand.clusterList = [{value : 0, pow : 1, sign : '+', isX : false}];
		succLog(eq.leftHand.logClusters() + ' = ' + eq.rightHand.logClusters());
		this.simplify();
	}
	this.findApplyableResolve = function() {
		var heighestPow		= 0;
		var lowestPow		= 1;
		var nonLinear		= false;

		for (var i = 0; i < this.leftHand.clusterList.length; i++)
		{
			if (this.leftHand.clusterList[i].sign.match(/[\*\/]/gi) !== null)
				nonLinear = true;
			if (this.leftHand.clusterList[i].isX)
			{
				heighestPow = this.leftHand.clusterList[i].pow > heighestPow ? this.leftHand.clusterList[i].pow : heighestPow;
				lowestPow = this.leftHand.clusterList[i].pow < lowestPow ? this.leftHand.clusterList[i].pow : lowestPow;
			}
		}
		if (lowestPow === 0 && heighestPow !== 0)
			this.removeNullPower();
		if (heighestPow === 2 && lowestPow >= 0 && !nonLinear)
			this.solve2ndDegree();
		else if (heighestPow === 1 && lowestPow >= 0 && !nonLinear)
			this.solveFirstDegree();
		else if (heighestPow === 0 && lowestPow === 0 && !nonLinear)
			succLog('Tous les nombre réels sont solution');
		else
			warnLog('There is no appropriate resolver for this type of equation');
	}
	this.removeNullPower = function() {
		for (var i = 0; i < this.leftHand.clusterList.length; i++)
		{
			if (this.leftHand.clusterList[i].isX && this.leftHand.clusterList[i].pow === 0)
			{
				this.leftHand.clusterList[i].pow = 1;
				this.leftHand.clusterList[i].isX = false;
			}
		}
		succLog(this.leftHand.logClusters());
	}
	this.solveFirstDegree = function() {
		var a = 0;
		var b = 0;
		var x = 0;

		for (var i = 0; i < this.leftHand.clusterList.length; i++)
		{
			if (this.leftHand.clusterList[i].isX === true)
				a += Number(this.leftHand.clusterList[i].sign + this.leftHand.clusterList[i].value);
			else
				b += Number(this.leftHand.clusterList[i].sign + this.leftHand.clusterList[i].value);
		}
		succLog('x = -(' + b + ') / ' + a);
		x = -b / a;
		succLog('X has a single solution')
		succLog('-> : ' + x);
	}
	this.solve2ndDegree = function() {
		var a = 0;
		var b = 0;
		var c = 0;
		var delta = null;

		for (var i = 0; i < this.leftHand.clusterList.length; i++)
		{
			if (this.leftHand.clusterList[i].pow === 2 && this.leftHand.clusterList[i].isX === true)
				a += Number(this.leftHand.clusterList[i].sign + this.leftHand.clusterList[i].value);
			else if (this.leftHand.clusterList[i].pow === 1 && this.leftHand.clusterList[i].isX === true)
				b += Number(this.leftHand.clusterList[i].sign + this.leftHand.clusterList[i].value);
			else
				c += Number(this.leftHand.clusterList[i].sign + this.leftHand.clusterList[i].value);
		}
		console.log(a, b, c);
		delta = Math.pow(b, 2) - (4 * a * c);
		if (delta > 0)
		{
			var x1 = (-b + Math.sqrt(delta)) / (2 * a);
			var x2 = (-b - Math.sqrt(delta)) / (2 * a);

			succLog('Delta is positif (' + delta + ')');
			succLog('X has two solutions :');
			succLog('-> : ' + x1);
			succLog('-> : ' + x2);
		}
		else if (delta < 0)
			warnLog('Delta is negatif (' + delta + ')\nCan\'t solve this :(')
		else
		{
			var solution = -(b / (2 * a));

			succLog('X has a single solution')
			succLog('-> : ' + solution);
		}
	}
	this.checkForInvalidReducingProcess = function() {
		var left		= {};
		var right		= {};
		var rightL		= 0;
		var leftL		= 0;
		var leftTypes	= 0;
		var rightTypes	= 0;

		for (var i = 0; i < this.leftHand.clusterList.length; i++)
		{
			if (this.leftHand.clusterList[i].isX)
			{
				if (this.leftHand.clusterList[i].sign === '-')
				{
					if (left[this.leftHand.clusterList[i].pow.toString()])
						left[this.leftHand.clusterList[i].pow.toString()] -= this.leftHand.clusterList[i].value;
					else
					{
						leftTypes++;
						left[this.leftHand.clusterList[i].pow.toString()] = this.leftHand.clusterList[i].value;
					}
				}
				else if (this.leftHand.clusterList[i].sign === '+')
				{
					if (left[this.leftHand.clusterList[i].pow.toString()])
						left[this.leftHand.clusterList[i].pow.toString()] += this.leftHand.clusterList[i].value;
					else
					{
						leftTypes++;
						left[this.leftHand.clusterList[i].pow.toString()] = this.leftHand.clusterList[i].value;
					}
				}
			}
			else
			{
				if (this.leftHand.clusterList[i].sign === '-')
					leftL -= this.leftHand.clusterList[i].value;
				else if (this.leftHand.clusterList[i].sign === '+')
					leftL += this.leftHand.clusterList[i].value;
			}
		}
		for (var i = 0; i < this.rightHand.clusterList.length; i++)
		{
			if (this.rightHand.clusterList[i].isX)
			{
				if (this.rightHand.clusterList[i].sign === '-')
				{
					if (right[this.rightHand.clusterList[i].pow.toString()])
						right[this.rightHand.clusterList[i].pow.toString()] -= this.rightHand.clusterList[i].value;
					else
					{
						rightTypes++;
						right[this.rightHand.clusterList[i].pow.toString()] = this.rightHand.clusterList[i].value;
					}
				}
				else if (this.rightHand.clusterList[i].sign === '+')
				{
					if (right[this.rightHand.clusterList[i].pow.toString()])
						right[this.rightHand.clusterList[i].pow.toString()] += this.rightHand.clusterList[i].value;
					else
					{
						rightTypes++;
						right[this.rightHand.clusterList[i].pow.toString()] = this.rightHand.clusterList[i].value;
					}
				}
			}
			else
			{
				if (this.rightHand.clusterList[i].sign === '-')
					rightL -= this.rightHand.clusterList[i].value;
				else if (this.rightHand.clusterList[i].sign === '+')
					rightL += this.rightHand.clusterList[i].value;
			}
		}
		if (rightL !== leftL && rightTypes === 0 && leftTypes === 0)
		{
			alertLog("Cette equation semble être incorrecte :(");
			return (null);
		}
		return (true);
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
	succLog(eq.leftHand.logClusters() + ' = ' + eq.rightHand.logClusters())
	if (eq.simplify() === null)
		continue ;
	if (eq.checkForInvalidReducingProcess() === null)
		continue ;
	if (eq.getReducedForm() === null)
		continue ;
	if (eq.findApplyableResolve() === null)
		continue ;
}
