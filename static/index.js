if (!localStorage.getItem('userName')) {
        do {
            var userName = prompt('Write Your Nickname:', 0);
        } while (! /^[a-z0-9]+$/gi.test(userName));
        localStorage.setItem('userName', userName);
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
            return false;
        };

        // When secected one of channel list
        document.querySelector('#listChannel').onclick =
        function() {
            socket.emit('channel selected', this.value);
           // return false;
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
    });

    // When flask return message
    socket.on('channel message', message => {
        const li = document.createElement('li');
        li.setAttribute('class', 'list-group-item list-group-item-light');
        li.innerHTML = message['userName'] + ' ' + message['date'] + '</br>' + message['msg'];
        document.querySelector('#messageList').appendChild(li);
    });


//    localStorage.clear();
});

/*
TO DO LIST:

- validate user name - implement funkction when user name is busy

- reverse channel list display
- new channel neme must be on top of the list

*/
