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
            console.log(ev.target.value.trim());
            obj.props.socket.emit('Register', {type:'resetChange', value: ev.target.value}, this.setError);
        }
    }

    setError(error){
        this.setState({error: error});
    }

    render(){
        return <div style={container}>
            <span>Afin de reinitialiser votre mot de passe veuillez rentrer l'adresse mail lie a votre compte.</span>
            <form style={form} onSubmit={this.handleSubmit}>
                <input style={input} type={"text"} onChange={(ev) => this.handleChange(ev, this)} name={"email"} value={this.state.email} autoComplete={"email"}/>
                {this.state.error}
                <input style={submit} type={"submit"} name={"Submit"} value={"Envoyer"} />
            </form>
        </div>
    }
}

const submit = {
    width: '45%',
    height: '3vmin',
    fontSize: '1.5vmin',
    outline: 'none',
    borderRadius: '2px',
    backgroundColor : 'white',
    border: '1px solid'
};

const input = {
    width: '65%',
    height: '5vmin',
    fontSize: '1.5vmin',
    outline: 'none',
    borderRadius: '2px',
    backgroundColor : 'white',
    border: '1px solid',
    marginBottom: '20px'
};

const form = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'rgb(10, 70, 107)',
    padding: '2vmin',
    flexDirection: 'column'
};

const container = {
    fontSize: '1.5vmin',
    marginTop: '20%',
    width: '35%',
    padding: '2vmin 5vmin 2vmin 5vmin',
    display: 'flex',
    alignItems: 'center',
    color: 'rgb(10, 70, 107)',
    borderRadius: '4px',
    flexDirection: 'column',
    backgroundColor: 'white',
};