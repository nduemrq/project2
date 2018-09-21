import os

from flask import Flask, render_template, session, jsonify
from flask_socketio import SocketIO, emit
from time import asctime

# olny for debug mode
from gevent import monkey
monkey.patch_all()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


class Chat:

    _chatStorage = dict()

    def channelExist(self, channelName):
        '''return True or False'''
        return str(channelName) in self._chatStorage

    def userExist(self, userName):
        pass

    def createChannel(self, channelName):
        '''if channel do not exist then
         add new dict to chatStorage'''
        if not self.channelExist(channelName):
            self._chatStorage[channelName] = []

            # initialize first msg
            self.addMessage('*** system *** ', f'Welcome to {channelName} channel.', channelName)

    def delChannel(self, channelName):
        pass

    def showChannels(self):
        return list(self._chatStorage)

    def showMessage(self, channelName):
        msg = self._chatStorage[channelName]
        for m in msg:
            yield m.showMsg()

    def addMessage(self, userName, message, channelName):
        msg = Msg(userName, asctime(), message, channelName)
        if len(self._chatStorage[channelName]) < 100:
            self._chatStorage[channelName].append(msg)
        else:
            self._chatStorage[channelName].pop(0)
            self._chatStorage[channelName].append(msg)
        return msg


class Msg:
    def __init__(self, userName, date, msg, channel):
        self.userName = userName
        self.date = date
        self.msg = msg
        self.channel = channel

    def showMsg(self):
        return dict(
            userName = self.userName,
            date = self.date,
            msg = self.msg,
            channel = self.channel
        )

# chat instance
chat = Chat()

# testing data
chat.createChannel('test 01')
chat.addMessage('1', 'test', 'test 01')
chat.addMessage('2', 'fasdlkflsdkflaskjflaskjdf', 'test 01')
chat.addMessage('3', 'ioeryuoieu oifuasoifu lkjfalkj', 'test 01')
chat.addMessage('4', ' sfdfad tryrty yuy i iuyiuy', 'test 01')


@app.route("/")
def index():
    return render_template('index.html', channelList= chat.showChannels())


@socketio.on("submit channel")
def checkNewChannel(data):
        if chat.channelExist(data):
            emit('channel error', 'Channel exist')
        else:
            chat.createChannel(data)
            emit('channel new', data, broadcast=True)


@socketio.on("channel selected")
def channelSelected(data):
    ''' When user selecteed one of channel list then
        thist function receive channel name.
        Need to return channel message. '''
    for msg in chat.showMessage(data):
        emit('channel message', msg)


@socketio.on("new message")
def newMessage(user, message, channel):
    newMessage = chat.addMessage(user, message, channel)
    emit('channel message', newMessage.showMsg(), broadcast=True)
