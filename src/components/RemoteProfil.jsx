import React from 'react';

export default class RemoteProfil extends React.Component{
    constructor(props){
        super(props);
    }

    render() {
        return (
            <div style={remoteContainer}>
                <div style={heartContainer}>
                    <div style={heart}>
                    </div>
                    <div style={halfHeart}>
                    </div>
                    <div style={Object.assign({}, halfHeart, {marginTop: '-2vmin', marginLeft: '1.9vmin'})}>
                    </div>
                </div>
            </div>
        )
    }
}

const white = {
    width: '24vmin',
    backgroundColor: 'blue'
};

const backHeart = {
    position: 'absolute',
    width: '10vmin',
    height: '10vmin',
    backgroundColor: '#610c0c',
};

const heartContainer = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'yellow',
    position: 'absolute',
    zIndex: '3',
    alignItems: 'center'
};

const halfHeart = {
    marginTop: '-2vmin',
    marginLeft: '-1.9vmin',
    height: '6vmin',
    width: '6vmin',
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: '50%',
};

const heart = {
    position: 'absolute',
    borderTop: '6vmin solid red',
    borderRight: '6vmin solid pink',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: 'white',
    display: 'inline-block',
    transform: 'rotate(-45deg)',
};

const remoteContainer = {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '7vmin',
    width: '24vmin',
    backgroundColor: '#000261'
};