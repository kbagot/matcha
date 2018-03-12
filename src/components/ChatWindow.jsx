import React from 'react';

export default class ChatWindow extends React.Component{
    constructor(props){
        super(props);
        this.renderMessages = this.renderMessages.bind(this);
    }


    renderMessages(){
        if (this.props.msg) {
            return (
                this.props.msg.map((elem, index) => {
                    const self = elem.from === this.props.user.id;
                    const selfMsgContainer = self ? Object.assign({}, msgContainer, {justifyContent: 'flex-end'}) : msgContainer;
                    const selfMessage = self ? Object.assign({}, message, {backgroundColor: 'rgb(10, 70, 105)', color: 'white'}) : message;
                    return (
                        <div key={elem.msg+index} style={selfMsgContainer}>
                            <p style={selfMessage}>{elem.msg}</p>
                        </div>
                    );
                })
            )
        }

    }

    render (){
        return (<div className={"textChatWindow"}>{this.renderMessages()}</div>);
    }
}


const msgContainer = {
    width: '100%',
    display: 'flex',
    flexWrap:'wrap'
};

const message = {
    fontSize: '1vmin',
    color: 'rgb(10, 70, 105)',
    padding: '0.6vmin',
    margin: '0.5vmin',
    maxWidth: '75%',
    overflowWrap: 'break-word',
    backgroundColor: 'rgba(9, 70, 106, 0.15)',
    borderRadius: '1vmin'
};