import React from 'react';

export default class UserPannel extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            display: false
        };
        this.handleButton = this.handleButton.bind(this);
        this.renderPannel = this.renderPannel.bind(this);
    }

    handleButton(ev){
        this.setState(prevState => ({display: !prevState.display}));
    }

    renderPannel(){
        if (this.state.display){
            return (
                <div className={"userPannel"}>
                    HELLOoOOooooooooooooooOOOOOOO
                </div>
            )
        }
    }

    render(){
        let userPannel = this.renderPannel();

        return (<div>
            <button onClick={this.handleButton}>Mon Compte</button>
            {userPannel}
        </div>)
    }
}