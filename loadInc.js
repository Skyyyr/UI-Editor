$(document).ready(function() {
    let elementCount = 0;

    $('#fileInput').on('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const contents = e.target.result;
                parseIncFile(contents);
            };
            reader.readAsText(file);
        }
    });

    function parseIncFile(contents) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(contents, "text/xml");
        $('#elementList').empty();  // Clear the element listing
        $('#editor').empty(); // Clear the editor grid
        populateEditor(xmlDoc.documentElement);
    }

    function populateEditor(element, parent) {
        const tagName = element.tagName;
        let newElement;

        if (['Page', 'Button', 'Image', 'Text'].includes(tagName)) {
            const name = element.getAttribute('Name');
            const location = element.getAttribute('Location');
            const size = element.getAttribute('Size');
            const localText = element.getAttribute('LocalText');

            const [left, top] = location ? location.split(',').map(Number) : [0, 0];
            const [width, height] = size ? size.split(',').map(Number) : [100, 50];

            newElement = createElement(tagName, name, left, top, width, height, parent, localText);

            $(element).children().each(function() {
                populateEditor(this, newElement);
            });
        }
    }

    function createElement(type, name, x, y, width, height, parentElement, text) {
        let id = `element${elementCount++}`;
        let newElement = $(`<div id="${id}" class="ui-element ${type.toLowerCase()} ${type.toLowerCase()}-element" data-type="${type}" data-name="${name}">${text || name || ''}</div>`);
        newElement.css({ left: x, top: y, width: width, height: height });

        if (parentElement) {
            $(parentElement).append(newElement);
        } else {
            $('#editor').append(newElement);
        }

        newElement.draggable({
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

        updateElementList();

        return newElement;
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

    // Update element details when clicking on an item in the element list
    $('#elementList').on('click', '.list-group-item', function() {
        let id = $(this).data('id');
        selectedElement = $(`#${id}`);
        updateElementDetails(selectedElement);
        $('.ui-element').removeClass('selected');
        selectedElement.addClass('selected');
    });
});
