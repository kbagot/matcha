import React from 'react';

export default class ImagesViewer extends React.Component{
    constructor(props){
        super(props);
    }

    leftArrow(){
        if (this.props.images) {
            const index = this.props.images.findIndex(elem => elem.imgid === this.props.imgid);

            if (index > 0) {
                return <a style={a} href={""} onClick={(ev) => this.props.previous(ev, index)}><span style={arrows}>{'\u27E8'}</span></a>
            }
        }
    }

    rightArrow(){
        if (this.props.images) {
            const index = this.props.images.findIndex(elem => elem.imgid === this.props.imgid);

            if (index < this.props.images.length - 1) {
                return <a style={a} href={""} onClick={(ev) => this.props.next(ev, index)}><span style={arrows}>{'\u27E9'}</span></a>
            }
        }
    }


    render(){
        return (
            <div style={imgContainer}>
                <div style={closeContainer}>
                    <a style={close} href="" onClick={this.props.display}>{'\u02DF'}</a>
                </div>
                <div style={altContainer}>
                    {this.leftArrow()}
                    <img style={img} src={"img/" +  this.props.imgid} />
                    {this.rightArrow()}
                </div>
            </div>
            )
    }
}

const close = {
    textDecoration: 'none',
    color: 'white',
    fontSize: '12vmin',
    padding: '7vmin',
};

const closeContainer = {
    position: 'absolute',
    width: '100%',
    top: '0',
    display: 'flex',
    padding: '7vmin',
    justifyContent: 'flex-end',
};

const img ={
    maxWidth: '75%',
};

const a ={
    textDecoration: 'none',
};

const arrows = {
    color: 'white',
    padding: '7vmin',
    fontSize: '8vmin'
};

const imgContainer = {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems:'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    color: 'white'
};

const altContainer = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center '
};