import os

from flask import Flask, render_template, session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channelList = ['test 1', 'test 2', 'test 3']


@app.route("/")
def index():
    return render_template('index.html', channelList=channelList)


@socketio.on("submit channel")
def checkNewChannel(data):
    channelName = data
    if channelName in channelList:
        emit('channel error', 'Channel exists.')
    else:
        channelList.append(channelName)
        emit('channel new', data, broadcast=True)
