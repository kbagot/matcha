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
        return (
            <div style={uploadContainer} className={"uploadFormContainer"}>
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
    borderRadius: '10vh',
    cursor: 'pointer',
    fontSize: '7vmin',
    width: '8vmin',
    height: '8vmin',
};

const uploadContainer = {
    position: 'relative',
    cursor: 'pointer',
    fontSize: '7vmin',
    width: '8vmin',
    height: '8vmin',
    marginTop: '6vmin',
    borderTop: '1px dashed gray',
    borderRight: '1px dashed gray',
};

const addPicture = {
    position: 'absolute',
    outline: 'none',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    lineHeight: '3vmin',
    padding: '0px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '7vmin',
    width: '8vmin',
    height: '8vmin',
    background: 'transparent',
    color: 'gray',
};