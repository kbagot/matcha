import React from 'react';

export default class UploadForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            file: null
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(ev){
        if (this.props.user.img.length < 5) {
            const reader = new FileReader();
            const file = ev.target.files[0];
            const extension = ['jpg', 'jpeg', 'png'].indexOf(file.name.split('.').pop());
            const type = ['image/jpg', 'image/jpeg', 'image/png'].indexOf(file.type) !== -1;

            reader.addEventListener('load', () => {
                let obj = {
                    type: 'upload',
                    ext: ['jpg', 'jpeg', 'png'][extension],
                    img: reader.result.replace(/^data:image\/(jpeg|jpg|png);base64,/, "")
                };
                this.props.socket.emit('profil', obj);
            });

            if (type && Number(file.size) <= 1000000 && extension !== -1) {
                reader.readAsDataURL(ev.target.files[0]);
            }
        }
    }

    render() {
        const obj = this.props.length > 1 ? uploadContainer : Object.assign({}, uploadContainer, {marginLeft: '5px'});

        return (
            <div style={obj} className={"uploadFormContainer"}>
                    <button style={addPicture}> +
                    </button>
                <input style={inputFile} type={"file"} id={"file"} onChange={this.handleChange} accept={".png, .jpg,.jpeg"}/>
            </div>
        )
    }
}

const inputFile = {
    position: 'absolute',
    opacity: '0',
    top: '0',
    borderRadius: '100px',
    cursor: 'pointer',
    fontSize: '70px',
    width: '80px',
    height: '80px',
};

const uploadContainer = {
    position: 'relative',
    cursor: 'pointer',
    fontSize: '70px',
    width: '80px',
    height: '80px',
    marginTop: '63px',
    borderTop: '1px dashed gray',
    borderRight: '1px dashed gray',
    marginLeft: '2px'
};

const addPicture = {
    position: 'absolute',
    outline: 'none',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    lineHeight: '3-px',
    padding: '0px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '70px',
    width: '80px',
    height: '80px',
    background: 'transparent',
    color: 'gray',
};