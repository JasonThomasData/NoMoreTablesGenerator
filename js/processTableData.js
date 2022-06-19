$(document).ready(function() {

	var headers = []
	function processData(allText) {
		//Separated with tabs
		var allTextLines = allText.split(/\r\n|\n/);
		headers = allTextLines[0].replace(/\t/g,';').split(';');
		//Everything that's not the header line
		var lines = [];
		lines.push(headers)

		for (var i=1; i<allTextLines.length; i++) {
			var rowData = allTextLines[i].replace(/\t/g,';').split(';');
			lines.push(rowData)
		}

		return lines
	}

	//For the text in the text area, create html elements and save those to disk
	function constructTable(tableHeading, cleanData, dataSourceName, dataSourceLink){
		var $table = $('<table>')
		var $thead = $('<thead>')
		var $tbody = $('<tbody>')
		
		function createHeading(tableHeading){
			var $headingForPage = $('<h3>')
			if (tableHeading.length > 0){
				$headingForPage.html(tableHeading)
				return $headingForPage
			}
			return ''
		}
		
		function createSourceAttribution(dataSourceName, dataSourceLink){
			if (dataSourceName.length > 0){
				var $dataAttributionPar = $('<p>')
				$dataAttributionPar.html('SOURCE: ')
				if (dataSourceLink.length > 0){
					var $dataAttributionHref = $('<a>')
					$dataAttributionHref.html(dataSourceName)
					$dataAttributionHref.attr('href', dataSourceLink)
					$dataAttributionHref.attr('target', '_blank')
					$dataAttributionPar.append($dataAttributionHref)
					return $dataAttributionPar
				}
				return $dataAttributionPar.append(dataSourceName)
			}
			return ''
		}
		
		function addCell(cleanCell){
			var $newCell = $('<td>')
			$newCell.html(cleanCell)
			return $newCell
		}

		function addHeader(cleanCell){
			var $newHeader = $('<th>')
			$newHeader.html(cleanCell)
			return $newHeader
		}

		function addRow(cleanRow, j){
			var $newRow = $('<tr>')
			for (var l = 0; l<cleanRow.length; l++){
				if (j == 0){
					var $cellToAdd = addHeader(cleanRow[l])
				} else {
					var $cellToAdd = addCell(cleanRow[l])
				}
				$newRow.append($cellToAdd)
			}
			return $newRow
		}
		
		var $headerToAdd = addRow(cleanData[0], 0)
		$thead.append($headerToAdd)
		$table.append($thead)
		for (var j = 1; j<cleanData.length; j++){
			var $rowToAdd = addRow(cleanData[j])
			$tbody.append($rowToAdd)
		}
		$table.append($tbody)
		
		$('#tableGoesHere').append(createHeading(tableHeading))
		$('#tableGoesHere').append($table)
		$('#tableGoesHere').append(createSourceAttribution(dataSourceName, dataSourceLink))
	}

	//PHP saves this to server location
	function processStyleSheet(styleString){
		styleString = styleString.replace('only screen and (max-width: 0px)', 'only screen and (max-width:' + sliderLeft + 'px)')
		var styleToAdd = ''
		for (h=0; h<headers.length; h++){
			var styleIndex = h+1
			var newStyleString = '\t' + 'td:nth-of-type(' + styleIndex + '):before { content: "' + headers[h] +'"; }'
			styleToAdd = styleToAdd + '\n' + newStyleString
		}
		styleString = styleString.replace('/*Insert data labels here*/', styleToAdd)
		return styleString
	}

	//PHP saves this to server location
	function processHtml(htmlTemplate, styleString){
		var $htmlFromTable = $('#tableGoesHere').html()
		var templateWithStyle = htmlTemplate.replace('/*style goes here*/', styleString)
		var htmlToSave = templateWithStyle.replace('<!--html goes here-->', $htmlFromTable)
		console.log(typeof htmlToSave)
		return String(htmlToSave)
	}

	//From the timestamp now, unique filename
	function getFileName(tablesFolderLocation){
		var fileName = Math.floor(new Date().getTime() / 1000)
		return tablesFolderLocation + fileName + '.html'
	}

	function showWidthPx(value){
		$('#showWidthPx').html('<b>This table will collapse when smaller than:</b> ' + value)
	}
	showWidthPx($('#slider').css('width'))

	//This is the jQuery function that initialises and defines the slider's functionality
	var sliderLeft = 0
	$(function() {
		$('#slider').slider({
			value: $('#tableWrapper').width(),
			min: 0,
			max: $('#tableWrapper').width(),
			//step: yearOptions.step,
			slide: function(event, ui){	
				sliderLeft = ui.value
				$('#tableGoesHere').css('width', sliderLeft)
				$('#revealTwo').css('opacity', 1)
				showWidthPx(ui.value + 'px')
			}
		});
	});

	//Clicking one updates all text areas
	$('#giveTableHeading, #textAreaData, #giveTableDataSourceName, #giveTableDataSourceLink').on('input', function(){
		var tableHeading = $('#giveTableHeading').val()
		var tableData = $('#textAreaData').val()
		var dataSourceName = $('#giveTableDataSourceName').val()
		var dataSourceLink = $('#giveTableDataSourceLink').val()
		$('#tableGoesHere').html('')
		var cleanData = processData(tableData)
		constructTable(tableHeading, cleanData, dataSourceName, dataSourceLink)
		$('#tableGoesHere').css('width', $('#tableWrapper').width())
		$('#revealOne').css('opacity', 1)
	});	

	//to a location on the server, the php script does this
	$('#saveTable').on('click', function(){
		var styleString = ''
		var tablesFolderLocation = 'tables/'
		var fileName = getFileName(tablesFolderLocation)
		var htmlToSave = ''
		$.get('css/tableStyles.css')
			.done(function(getStyles){
				styleString = processStyleSheet(getStyles)
			})
			.fail(function(data){
				alert('Table CSS not located', data);
				return 
			})

		$.get('template.txt')
			.done(function(getHtmlTemplate){
				htmlToSave = processHtml(getHtmlTemplate, styleString) //After this, the table will have the styles and html in one long string
				console.log(htmlToSave)
				var blob = new Blob([htmlToSave], {type: "text/plain;charset=utf-8"});
				saveAs(blob, fileName);
			})
			.fail(function(data){
				alert('Table template not located', data);
				return
			})
	});
});