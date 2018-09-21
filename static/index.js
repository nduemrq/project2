if (!localStorage.getItem('userName')) {
        do {
            var userName = prompt('Write Your Nickname:', 0);
        } while (! /^[a-z0-9]+$/gi.test(userName));
        localStorage.setItem('userName', userName);
}
if (!localStorage.getItem('channelSelected')){
    localStorage.setItem('channelSelected', 'test 01');
}

function removeBadge(badge) {
        if (badge){
            badge.parentNode.removeChild(badge);
        }
}

document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Add userName to chat input
    document.querySelector('#messageInput').innerHTML = localStorage.getItem('userName') + ': ';

    // Enable button only if there is text in the input field
    document.querySelector('#submitChannelName').disabled = true;
    document.querySelector('#channelName').onkeyup = () => {
        if (document.querySelector('#channelName').value.length > 0)
            document.querySelector('#submitChannelName').disabled = false;
        else
            document.querySelector('#submitChannelName').disabled = true;
    };

    socket.on('connect', () => {
        // Send to flask new channel name
        document.querySelector('#createChannel').onsubmit = () => {
            var channelName = document.querySelector('#channelName').value;
            socket.emit('submit channel', channelName);
            document.querySelector('#channelName').value = '';
            return false;
        };

        // When secected one of channel list
        document.querySelector('#listChannel').onclick =
        function() {
            socket.emit('channel selected', this.value);
            localStorage.setItem('channelSelected', this.value);
        };

        // Send message
        document.querySelector('#messageForm').onsubmit = () => {
            socket.emit('new message',
                        localStorage.getItem('userName'), document.querySelector('#message').value, localStorage.getItem('channelSelected'));

            document.querySelector('#message').value = '';
            return false;
        };
    });

    // When channel name exiest
    socket.on('channel error', data => {
        // Remove old badge
        removeBadge(document.querySelector('.error'));

        // Setup new badge
        const span = document.createElement("span");
        span.setAttribute('class', 'badge badge-danger error');
        span.innerHTML = data;
        document.querySelector('#submitChannelGroup').appendChild(span);

    });

    // When add channel name to channel list, put channelName to select>option
    socket.on('channel new', data => {
        // Remove old badge
        removeBadge(document.querySelector('.error'));

        // Add new channel name to list
        const option = document.createElement("option");
        option.setAttribute("value", data);
        option.innerHTML = data;
        document.querySelector('#listChannel').appendChild(option);
        option.scrollIntoView();
    });

    // When flask return message
    socket.on('channel message', message => {
        if (message['channel'] == localStorage.getItem('channelSelected')) {
            const li = document.createElement('li');
            li.setAttribute('class', 'list-group-item list-group-item-light');
            li.innerHTML = message['userName'] + '<br> ' + message['date'] + '<br>' + message['msg'];
            document.querySelector('#messageList').appendChild(li);
            li.scrollIntoView();
        }
    });

//    localStorage.clear();
});

/*
TO DO LIST:

- validate user name - implement funkction when user name is busy

- reverse channel list display
- new channel neme must be on top of the list

*/
