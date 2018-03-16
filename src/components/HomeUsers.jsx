import React from 'react';
import DisplayUsers from './DisplayUsers.jsx'

export default class HomeUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idList: [],
            result:[],
            more: false
        };
        this.refresh = this.refresh.bind(this);
    }

    componentWillMount() {
        window.scrollTo(0, 0);

        this.setState ({
            idList: this.props.idList
        },
            () => this.refresh()
        );
    }

    componentDidMount() {
        this.props.socket.on('ReceiveUsersHome', (users) => {
            let data = [];
            if (users) {
                users.forEach(users => {
                    data.push(users);
                });
                this.setState({
                    result: data
                })
            }
        });
    }

    componentWillUnmount() {
        this.props.socket.off('ReceiveUsersHome');
    }

    handleClick () {
            this.setState({['res']: this.state.result});
    }

    componentWillReceiveProps(nextProps){
        // if (nextProps.refreshlist)
        //     this.refresh();
        this.setState ({
            idList: nextProps.idList
        },
           () => {
            // console.log('refresh' +  this.state.idList);
            this.refresh();
           }
        );
    }

    refresh () {
        this.props.socket.emit('HomeUsers', this.state.idList);
    }

    render() {
        // let res = this.state.result.slice(0, 4);
        // console.log(this.props.star);
        let res = this.state.result;
        if (this.props.idList === 'star' && this.props.num !== 0)
            res = this.state.result.slice(0, this.props.num);


        return (
            <div className={'homeres'}>
            <DisplayUsers user={this.props.user} handleClick={this.props.handleClick}
                          result={res} allUsers={this.props.allUsers} idList={'home'}/>
            </div>
                    // <div className="resUser" onClick={(ev) => this.props.handleClick(ev, this.state.result[1])}>
                    // dffdff</div>
        )
    }
}
