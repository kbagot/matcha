import React from 'react';

export default class UserSettings extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            login: '',
            email: '',
            password: '',
            display: false,
            editLogin: false,
            editMail: false,
            editPassword: false
        };
        this.handleButton = this.handleButton.bind(this);
        this.renderPannel = this.renderPannel.bind(this);
        this.renderLogin = this.renderLogin.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
    }

    handleButton(ev){
        this.setState(prevState => ({display: !prevState.display}));
    }

    handleSubmit(ev){
        console.log(ev.target.name);
        ev.preventDefault();
    }


    handleChange(ev){
        this.setState({[ev.target.name]: ev.target.value});
    }

    handleEdit(ev){
        const obj = {login: '', email: '', password: '', editLogin: false, editMail: false, editPassword: false};

        obj[ev.target.name] = true;
        this.setState(obj);
    }

    renderEmail(edit){
        return (
            <div>
                Email:  { edit ?
                <form name="editMail" onSubmit={this.handleSubmit}>
                    <input type={"text"} name={"email"} value={this.state.email} onChange={this.handleChange}/>
                    <input type={"submit"} />
                </form>
                : <span> {this.props.user.email} <button name="editMail" onClick={this.handleEdit}>Modifier</button></span>
            }
            </div>
        )
    }

    renderLogin(edit){
        return (
            <div>
                Login: { edit ?
                <form name="editLogin" onSubmit={this.handleSubmit}>
                    <input type={"text"} name={"login"} value={this.state.login} onChange={this.handleChange}/>
                    <input type={"submit"} />
                </form>
                : <span> {this.props.user.login} <button name="editLogin" onClick={this.handleEdit}>Modifier</button></span>
            }
            </div>
        )
    }

    renderPannel(){
        if (this.state.display){
            return (
                <div className={"userSettings"}>
                    {this.renderLogin(this.state.editLogin)}
                    {this.renderEmail(this.state.editMail)}
                </div>
            )
        }
    }

    render(){
        let userSettings = this.renderPannel();

        return (
            <div>
                <button onClick={this.handleButton}>Mon Compte</button>
                {userSettings}
            </div>)
    }
}