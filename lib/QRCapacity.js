var QRCapactity = 
{
	"L":
		[
			17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586, 644, 718, 792, 858, 929, 1003, 1091, 1171, 1273, 1367, 1465, 1528, 1628, 1732, 1840, 1952, 2068, 2188, 2303, 2431, 2563, 2699, 2809, 2953
		],
	"M":
		[
			14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666, 711, 779, 857, 911, 997, 1059, 1125, 1190, 1264, 1370, 1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331
		],
	"Q":
		[
			11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292, 322, 364, 394, 442, 482, 509, 565, 611, 661, 715, 751, 805, 868, 908, 982, 1030, 1112, 1168, 1228, 1283, 1351, 1423, 1499, 1579, 1663
		],
	"H":
		[
			7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382, 403, 439, 461, 511, 535, 593, 625, 658, 698, 742, 790, 842, 898, 958, 983, 1051, 1093, 1139, 1219, 1273
		]
};

var versionToModuleMap = 
[
	21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113, 117, 121, 125, 129, 133, 137, 141, 145, 149, 153, 157, 161, 165, 169, 173, 177
];

function getMinQRVersion(textLen, errorCorrectionLevel)
{
	var qrCapForErrLvl = QRCapactity[errorCorrectionLevel];
	if(qrCapForErrLvl==undefined)
	{
		qrCapForErrLvl = QRCapactity["L"];
	}
	
	var level = -1;
	var maxLevel = qrCapForErrLvl.length;
	for (var i=0; i<maxLevel; i++)
	{
		if(qrCapForErrLvl[i]>textLen)
		{
			level = i+1;
			break;
		}
	}
	
	if(level == -1)
	{
		throw new Error(textLen + " is > max text length for errorCorrectionLevel: " + errorCorrectionLevel + " (" + qrCapForErrLvl[maxLevel-1] + ")");
	}
	
	return level;
}

function getModuleCountForVersion(level)
{
	return versionToModuleMap[level-1];
}

exports.getMinQRVersion = getMinQRVersion;
exports.getModuleCountForVersion = getModuleCountForVersion;