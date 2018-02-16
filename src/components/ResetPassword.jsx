import React from 'react';

export default class ResetPassword extends React.Component{
    constructor(props){
        super(props);
        this.state = {
          email: '',
          error: '',
          valid: false
        };
        this.setError = this.setError.bind(this);
    }

    handleChange (ev, obj) {
        if (ev.target.name === 'email'){
            obj.setState({email: ev.target.value.trim()});
            obj.props.socket.emit('Register', {type:'resetChange', value: ev.target.value}, this.setError);
        }
    }

    setError(error){
        this.setState({error: error});
    }

    render(){
        return <div>
            <p>Afin de reinitialiser votre mot de passe veuillez rentrer votre adresse mail lie a votre compte.</p>
            <form onSubmit={this.handleSubmit}>
                <input type={"text"} onChange={(ev) => this.handleChange(ev, this)} name={"email"} value={this.state.email} autoComplete={"email"}/> {this.state.error} <br /><br />
                <input type={"submit"} name={"Submit"} value={"Envoyer"} /><br />
            </form>
            <br />
        </div>
    }
}