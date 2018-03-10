import React from 'react';
import DisplayUsers from './DisplayUsers.jsx'

export default class HomeUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            task: this.props.task,
            idList: ['500', '400'],
            result:[]
        };
        // this.setProfil = this.setProfil.bind(this);
    }

    componentDidMount() {
        if (this.props.task){
            console.log(this.state);
            this.props.socket.emit('HomeUsers', this.state, (users) => {
                console.log(users);
                let data = [];
                users.result.forEach(users => {
                    data.push(users);
                });
                // if (this.state.dofirstmatch) {
                //     users.dofirstmatch = '';
                //     users.result = data;
                //     users.matchtag = users.tags;
                //     this.setState(users, () => {
                //         window.addEventListener("scroll", this.handleScroll);
                //     });
                // }
                // else {
                //     if (this.state.resultLength > 0 && from === 'scroll') {
                //         this.setState({
                            // result: [login]
                            // result: [...this.state.result, ...data]
                        // }, () => {
                        //     window.addEventListener("scroll", this.handleScroll);
                        // })
                    // } else {
                        this.setState({
                            result: data
                    //         result: [...this.state.result, ...login]
                        })
                        //     console.log(this.state);
                        //     window.addEventListener("scroll", this.handleScroll);
                        // });
                    // }
                // }
            //
            });
        }

    }

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    render() {

console.log(this.state.result);
        return (
            <DisplayUsers user={this.props.user} profil={this.props.profil} handleClick={this.props.handleClick}
                          result={this.state.result} allUsers={this.props.allUsers}/>
                    // <div className="resUser" onClick={(ev) => this.props.handleClick(ev, this.state.result[1])}>
                    // dffdff</div>
        )
    }
}
