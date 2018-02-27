import React from 'react';

export default class UploadForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            file: null
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(ev){
        console.log(ev.target.value);
        let input = document.querySelector("#file").files[0];
        let reader = new FileReader();


        console.log(input);
        reader.readAsDataURL(input);
        // console.log(reader.result);
        // this.setState({file: ev.target.value});
    }

    handleSubmit(ev){
        // console.log(this.state.file);
        // console.log(ev.target);
        ev.preventDefault();
    }

    render() {
        return (
            <div className={"uploadFormContainer"}>
                <form name={"uploadForm"} className={"uploadForm"} onSubmit={this.handleSubmit}>
                    <label htmlFor="file" className="file">Upload</label>
                    <input type={"file"} id={"file"} onChange={this.handleChange}/>
                    <input type={"submit"} value={"Upload"}/>
                </form>
            </div>
        )
    }
}