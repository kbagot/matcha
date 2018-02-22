import React from 'react';
import SelectTags from './SelectTags.jsx';

export default class Research extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            M: '',
            F: '',
            T: '',
            hetero: '',
            bi: '',
            trans: '',
            gay: '',
            min: '',
            max: '',
            distance: '',
            tags: [],
            order: {
                tags: '',
                distance: '',
                age: '',
            },
            result: [],
            match: ''
        };
        this.getTags = this.getTags.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    // componentWillUpdate(nextProps, nextState)  //TODO refresh animation  maybe  on this

    // componentDidUpdate(prevProps, prevState) {
    // }

    // refresh() {
    //
    //
    // }

    async componentDidMount () {
        if (this.props.match){
            await this.setState({['match']: 'match'});
            this.refresh('mount');
            console.log(this.state);
        }
    }

    refresh(mount) {
        this.props.socket.emit('ResearchUsers', this.state, (users) => {
            console.log(users);

            let login = [];
            users.results.forEach(users => {
                login.push(users.login);
            });
            if (mount) {
                delete users.opt.match;
                this.setState(users.opt);
            }
            this.setState({
                // result: [users.login]
                result: [login]
                // result: [...this.state.result, users.login]
            });
            console.log(this.state);
            // console.log(this.state.result);
        });
    }

    async getTags(tags) {
        let ptags = tags.map(val => val.value);
        await this.setState({['tags']: ptags});
        console.log('ssalut');
        console.log(this.state);
        this.refresh();
    }

    async handleChange(ev) {
        let t = ev.target;

        if (ev.target.type === 'checkbox') {
            this.state[ev.target.name] === '' ? await this.setState({[ev.target.name]: ev.target.name}) : await this.setState({[ev.target.name]: ''});
        } else if (ev.target.name.split(' ')[0] !== 'sort') {
            // if ((t.name === 'min' || t.name === 'max') && (t.value < 18 || t.value > 99)){
            //     if (t.name === 'min')
            //        await this.setState({[ev.target.name]: '18'});
            //     return;
            // }
            await this.setState({[ev.target.name]: ev.target.value});
        }
        else {
            let val = this.state.order[ev.target.name.split(' ')[1]];
            let order = Object.assign({}, this.state.order);  // TODO {...this.state.order} why didnotW?
            let modif = ev.target.name.split(' ')[1];

            for (let i in order) {
                if (i === modif)
                    order[i] = val === '' ? 'ASC' : val === 'ASC' ? 'DESC' : '';
                else
                    order[i] = '';
            }
            await this.setState(
                {order}
            );
        }
        this.refresh();
        // console.log(this.state);
        // this.refresh();
    }

    sortbox() {
        return (
            <div>
                <br/>TRIE<br/>
                <input type="button" name="sort age" value={"age " + this.state.order.age}
                       onClick={this.handleChange}/>
                <input type="button" name="sort distance" value={"distance " + this.state.order.distance}
                       onClick={this.handleChange}/>
                <input type="button" name="sort tags" value={"tags " + this.state.order.tags}
                       onClick={this.handleChange}/>
            </div>
        )
    }

    genderbox() {
        return (
            <div>
                <br/>Genres :<br/>
                M :<input type="checkbox" name="M" onChange={this.handleChange}/>
                F :<input type="checkbox" name="F" onChange={this.handleChange}/>
                T :<input type="checkbox" name="T" onChange={this.handleChange}/>
            </div>
        )
    }

    attractionbox() {
        return (
            <div>
                <br/>Attirances :<br/>
                Hetero :<input type="checkbox" name="hetero" onChange={this.handleChange}/>
                Bi :<input type="checkbox" name="bi" onChange={this.handleChange}/>
                Gay :<input type="checkbox" name="gay" onChange={this.handleChange}/>
                Trans :<input type="checkbox" name="trans" onChange={this.handleChange}/>
            </div>
        )
    }

    agebox() {
        return (
            <div>
                <br/>Age:<br/>
                minimum :<input type="number" name="min" min="18" max="99"
                                onChange={this.handleChange}/>
                maximum :<input type="number" name="max" min="18" max="99"
                                onChange={this.handleChange}/>
            </div>
        )
    }

    distancebox() {
        return (
            <div>
                <br/>Distance:<br/>
                max distance en km :<input type="number" name="distance" min="0" max="20000"
                           onChange={this.handleChange}/>
            </div>
        )
    }

    tagsbox() {
        return (
            <div>
                <br/>Tags:<br/>
                <SelectTags socket={this.props.socket} sendTags={this.getTags}/>
            </div>
        )
    }

    render() {
        let sort = this.sortbox();
        let gender = !this.state.match ? this.genderbox() : '';
        let attraction = !this.state.match ? this.attractionbox() : '';
        let age = this.agebox();
        let distance = this.distancebox();
        let tags = this.tagsbox();

        return (
            <form>
                {sort}
                {gender}
                {attraction}
                {age}
                {distance}
                {tags}
                <span>{this.state.result}</span>
            </form>
        );
    }
}

