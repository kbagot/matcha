import React from 'react';

export default class ResetPassword extends React.Component{
    constructor(props){
        super(props);
        this.state = {
          email: '',
          error: null,
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
        const valid = !(this.state.error === null && this.state.email);

        return <div style={container}>
            <span>Afin de reinitialiser votre mot de passe veuillez rentrer l'adresse mail lie a votre compte.</span>
            <form style={form} onSubmit={(ev) => this.props.submit(ev, this.state.email)}>
                <input style={input} type={"text"} onChange={(ev) => this.handleChange(ev, this)} name={"email"} value={this.state.email} autoComplete={"email"}/>
                <span style={error}>{this.state.error}</span>
                <input style={submit} type={"submit"} name={"Submit"} value={"Envoyer"} disabled={valid}/>
            </form>
        </div>
    }
}

const error ={
    margin: '5px',
    fontSize: '20px',
    color: 'indianred'
};

const submit = {
    width: '200px',
    minHeight: '35px',
    fontSize: '20px',
    outline: 'none',
    borderRadius: '2px',
    backgroundColor : 'white',
    border: '1px solid',
    marginTop: '25px'
};

const input = {
    width: '280px',
    minHeight: '45px',
    fontSize: '20px',
    outline: 'none',
    borderRadius: '2px',
    backgroundColor : 'white',
    border: '1px solid',
    marginBottom: '5px'
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
    fontSize: '20px',
    minHeight: '200px',
    width: '400px',
    minWidth: '400px',
    padding: '40px 70px',
    display: 'flex',
    alignItems: 'center',
    color: 'rgb(10, 70, 107)',
    borderRadius: '4px 0px 4px 4px',
    flexDirection: 'column',
    backgroundColor: 'white',
};