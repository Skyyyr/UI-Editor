$(document).ready(function() {
    let elementCount = 0;
    let selectedElement = null;

    // Function to create a new element and append it to the editor
    function createElement(type, name, x, y, width, height, parentElement) {
        let id = `element${elementCount++}`;
        let newElement = $(`<div id="${id}" class="ui-element ${type.toLowerCase()} ${type.toLowerCase()}-element" data-type="${type}" data-name="${name}">${name || ''}</div>`);
        newElement.css({ left: x, top: y, width: width, height: height });
        
        $('#editor').append(newElement);
        $(newElement).draggable({
            containment: '#editor',
            start: function(event, ui) {
                selectedElement = $(this);
                updateElementDetails(selectedElement);
            },
            stop: function(event, ui) {
                updateElementDetails(selectedElement);
            }
        }).resizable({
            containment: '#editor',
            resize: function(event, ui) {
                updateElementDetails($(this));
            }
        });

        newElement.on('click', function() {
            selectedElement = $(this);
            updateElementDetails(selectedElement);
            $('.ui-element').removeClass('selected');
            $(this).addClass('selected');
        });

        if (parentElement) {
            $(parentElement).append(newElement);
        }
        
        updateElementList();
    }

    function updateElementList() {
        $('#elementList').empty();
        $('.ui-element').each(function() {
            let id = $(this).attr('id');
            let name = $(this).data('name') || 'unnamed';
            let type = $(this).data('type');
            let parentId = $(this).parent().attr('id') || 'none';
            $('#elementList').append(`<a href="#" class="list-group-item list-group-item-action" data-id="${id}" data-type="${type}" data-parent="${parentId}">${name} (${type})</a>`);
        });
    }

    function updateElementDetails(element) {
        if (!element) return;
        let id = element.attr('id');
        let name = element.data('name') || 'unnamed';
        let position = element.position();
        let width = element.width();
        let height = element.height();
        let color = rgbToHex(element.css('background-color'));
        let parentName = element.parent().data('name') || 'none';

        $('#elementDetails').html(`
            <h4>${name}</h4>
            <p>Type: ${element.data('type')}</p>
            <p>Parent: ${parentName}</p>
            <p>Coordinates: (${Math.round(position.left)}, ${Math.round(position.top)})</p>
            <p>Width: ${width}px</p>
            <p>Height: ${height}px</p>
            <p>Color: <input type="color" id="colorPickerDetail" value="${color}"></p>
            <p>Name: <input type="text" id="elementNameDetail" value="${name}"></p>
        `);

        $('#colorPickerDetail').on('input', function() {
            element.css('background-color', $(this).val());
        });

        $('#elementNameDetail').on('input', function() {
            element.data('name', $(this).val());
            element.text($(this).val());
            updateElementList();
        });
    }

    $('#addElement').on('click', function() {
        let name = $('#elementName').val() || 'unnamed';
        let type = $('#elementType').val();
        createElement(type, name, 0, 0, 100, 50);
    });

    $('#addChildElement').on('click', function() {
        if (!selectedElement) return;
        let name = $('#elementName').val() || 'unnamed child';
        createElement($('#elementType').val(), name, 0, 0, 100, 50, selectedElement);
    });

    $('#removeElement').on('click', function() {
        if (selectedElement) {
            selectedElement.remove();
            updateElementList();
            $('#elementDetails').empty();
        }
    });

    $('#compileCode').on('click', function() {
        let fileName = $('#incFileName').val() || 'unnamed_page';
        let code = '';

        // Generate code with proper indentation and element properties
        function generateCode(element, level) {
            let type = element.data('type');
            let name = element.data('name') || 'unnamed';
            let position = element.position();
            let width = element.width();
            let height = element.height();
            let color = rgbToHex(element.css('background-color'));

            let indent = '    '.repeat(level);
            let codeStr = '';

            if (type === 'Page') {
                codeStr = `${indent}<Page\n` +
                    `${indent}    Location='${Math.round(position.left)},${Math.round(position.top)}'\n` +
                    `${indent}    Name='${name}'\n` +
                    `${indent}    ScrollExtent='${width},${height}'\n` +
                    `${indent}    Size='${width},${height}'\n` +
                    `${indent}    Visible='true'\n` +
                    `${indent}>\n`;
            } else if (type === 'Button') {
                codeStr = `${indent}<Button\n` +
                    `${indent}    LocalText='${name}'\n` +
                    `${indent}    Location='${Math.round(position.left)},${Math.round(position.top)}'\n` +
                    `${indent}    Name='${name}'\n` +
                    `${indent}    Size='${width},${height}'\n` +
                    `${indent}    OpacityRelativeMin='0.70'\n` +
                    `${indent}    PackLocation='fff,fff'\n` +
                    `${indent}    PackSize='p,f'\n` +
                    `${indent}    RStyleDefault='/Styles.New.buttons.hud.style'\n` +
                    `${indent}    ScrollExtent='${width},${height}'\n` +
                    `${indent}    Style='/Styles.New.buttons.hud.style'\n` +
                    `${indent}>${name}</Button>\n`;
            } else if (type === 'Text') {
                codeStr = `${indent}<Text\n` +
                    `${indent}    Font='/Fonts.verdana_bold_12'\n` +
                    `${indent}    LocalText='${name}'\n` +
                    `${indent}    Location='${Math.round(position.left)},${Math.round(position.top)}'\n` +
                    `${indent}    MinimumSize='${width},${height}'\n` +
                    `${indent}    Name='${name}'\n` +
                    `${indent}    OpacityRelativeMin='0.80'\n` +
                    `${indent}    PackLocation='nfn,nfn'\n` +
                    `${indent}    PackSize='h,f'\n` +
                    `${indent}    PalText='header'\n` +
                    `${indent}    ScrollExtent='${width},${height}'\n` +
                    `${indent}    Size='${width},${height}'\n` +
                    `${indent}    TextAlignment='Center'\n` +
                    `${indent}    TextAlignmentVertical='Center'\n` +
                    `${indent}    TextColor='#97FFFF'\n` +
                    `${indent}>${name}</Text>\n`;
            } else if (type === 'Image') {
                codeStr = `${indent}<Image\n` +
                    `${indent}    Location='${Math.round(position.left)},${Math.round(position.top)}'\n` +
                    `${indent}    Name='${name}'\n` +
                    `${indent}    ScrollExtent='${width},${height}'\n` +
                    `${indent}    Size='${width},${height}'\n` +
                    `${indent}    SourceRect='0,0,0,0'\n` +
                    `${indent}    SourceResource='update this'\n` +
                    `${indent}/>\n`;
            }

            let children = element.children('.ui-element');
            if (children.length > 0) {
                codeStr += children.map(function() {
                    return generateCode($(this), level + 1);
                }).get().join('');
            }

            if (type === 'Page') {
                codeStr += `${indent}</Page>\n`;
            }

            return codeStr;
        }

        // Generate code for the root element
        code = `<Page\n` +
            `    Name='${fileName}'\n` +
            `    ScrollExtent='1024,768'\n` +
            `    Size='1024,768'\n` +
            `    Visible='false'\n` +
            `>\n` +
            generateCode($('#editor'), 1) +
            `</Page>`;

        $('#compiledCode').text(code);
    });

    $('#elementList').on('click', '.list-group-item', function() {
        let id = $(this).data('id');
        selectedElement = $(`#${id}`);
        updateElementDetails(selectedElement);
        $('.ui-element').removeClass('selected');
        selectedElement.addClass('selected');
    });

    function rgbToHex(rgb) {
        let rgbArray = rgb.match(/\d+/g);
        if (rgbArray) {
            let r = parseInt(rgbArray[0], 10);
            let g = parseInt(rgbArray[1], 10);
            let b = parseInt(rgbArray[2], 10);
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        }
        return '#FFFFFF'; // default color
    }
	
	// Function to compile the code and set up the download link
	// Function to compile the code and set up the download link
	function compileAndDownload() {
		let fileName = $('#incFileName').val() || 'unnamed_page';
		let code = $('#compiledCode').text();
		if (!code) {
			alert('No code to download. Please compile the code first.');
			return;
		}

		// Create a Blob from the code
		let blob = new Blob([code], { type: 'text/plain' });
		let url = URL.createObjectURL(blob);

		// Update the download link
		let downloadLink = $('#downloadLink');
		downloadLink.attr('href', url);
		downloadLink.attr('download', `${fileName}.inc`);
		downloadLink.show(); // Show the download link
	}

	// Attach the compileAndDownload function to the compile button click event
	$('#downloadLink').on('click', function() {
		compileAndDownload();
		console.log("download?")
	});


});
