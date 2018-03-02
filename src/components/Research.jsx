import React from 'react';
import SelectTags from './SelectTags.jsx';
import Ripple from 'react-ripples';

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
                spop: ''
            },
            result: [],
            resultLength: 0,
            dofirstmatch: '',
            matchtag: '',
            match: '',
        };
        this.getTags = this.getTags.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.refresh = this.refresh.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    // componentWillUpdate(nextProps, nextState)  //TODO refresh animation  maybe  on this

    // componentDidUpdate(prevProps, prevState) {
    // }

    componentWillMount() {
        if (this.props.match)
            this.setState({
                ['dofirstmatch']: 'match',
                ['match']: 'match'
            });
    }

    componentDidMount() {
        if (this.state.dofirstmatch)
            this.refresh();
        window.addEventListener("scroll", this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScroll);
    }

    handleScroll() {
        const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const windowBottom = windowHeight + window.pageYOffset;
        if (windowBottom >= docHeight) {
            this.setState({['resultLength']: this.state.result.length}, () => this.refresh('scroll'));
        }
    }

    refresh(from) {
        window.removeEventListener("scroll", this.handleScroll);
        this.props.socket.emit('ResearchUsers', this.state, (users) => {
            let data = [];
            users.result.forEach(users => {
                data.push(users);
            });
            if (this.state.dofirstmatch) {
                users.dofirstmatch = '';
                users.result = data;
                users.matchtag = users.tags;
                this.setState(users, () => {
                    console.log(this.state);
                    window.addEventListener("scroll", this.handleScroll);
                });
            }
            else {
                console.log(this.state.result.length);
                if (this.state.resultLength > 0 && from === 'scroll') {
                    this.setState({
                        // result: [login]
                        result: [...this.state.result, ...data]
                    }, () => {
                        console.log(this.state);
                        window.addEventListener("scroll", this.handleScroll);
                    })
                } else {
                    this.setState({
                        result: data
                        // result: [...this.state.result, ...login]
                    }, () => {
                        console.log(this.state);
                        window.addEventListener("scroll", this.handleScroll);
                    });
                }
            }

        });
    }

    getTags(tags) {
        let ptags = tags.map(val => val.value);
        if (!this.props.match)
            this.setState({['tags']: ptags}, () => {
                this.refresh()
            });
        else
            this.setState({['tags']: [...ptags, ...this.state.matchtag]}, () => {
                this.refresh()
            });
    }

    handleChange(ev) {
        let t = ev.target;

        if (ev.target.type === 'checkbox') {
            this.state[ev.target.name] === '' ? this.setState({[ev.target.name]: ev.target.name}, () => this.refresh()) : this.setState({[ev.target.name]: ''}, () => this.refresh());
        } else if (ev.target.name.split(' ')[0] !== 'sort') {
            this.setState({
                [ev.target.name]: ev.target.value,
            }, () => this.refresh());
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
            order.resultLength = 0;
            this.setState({
                    order,
                    ['resultLength']: 0
                },
                () => this.refresh()
            );
        }
    }

    sortbox() {
        return (
            <div>
                <br/>TRIE<br/>
                  <div> <input type="button" name="sort age" value={"Age"} className={'sortbutton'}
                             onClick={this.handleChange}/>
                      <div className={this.state.order.age}></div>
                  </div>
                    <input type="button" name="sort distance" value={"Distance"} className={this.state.order.distance}
                           onClick={this.handleChange}/>
                    <input type="button" name="sort tags" value={"Tags"} className={this.state.order.tags}
                           onClick={this.handleChange}/>
                    <input type="button" name="sort spop" value={"Popularite"} className={this.state.order.spop}
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
        let gender = !this.props.match ? this.genderbox() : '';
        let attraction = !this.props.match ? this.attractionbox() : '';
        let age = this.agebox();
        let distance = this.distancebox();
        let tags = this.tagsbox();

        let restyle = {
            display: 'flex',
        };

        let formstyle = {
            borderRadius: '15px',
            backgroundColor: 'teal',
            position: 'fixed',
            width: '19%',
            minWidth: '300px',
            marginBottom: '10%',
            height: '60%',
            bottom: '0'

        };

        let uliststyle = {
            backgroundColor: 'red',
            // marginLeft: '20%',
            margin: 'auto',
            // position: 'fixed',
            height: '100%',
            width: '79%',
            display: 'inline-block'
        };

        let userstyle = {
            backgroundColor: 'pink',
            width: '20%',
            minWidth: '250px',
            height: '200px',
            display: 'inline-block'
        };

        return (
            <div style={restyle}>
                <form className={'resForm'} style={formstyle}>
                    {sort}
                    {gender}
                    {attraction}
                    {age}
                    {distance}
                    {tags}
                </form>
                <div style={uliststyle}>
                    {this.state.result.map((node, key) => {
                        let img = node.img;

                        if (!img && node.sexe === 'F')
                            img = '../../img/nopicF.jpg';
                        else if (!img && node.sexe === 'M')
                            img = '../../img/nopicM.jpg';
                    return (<div key={key} style={userstyle} >
                        <img src={img} width={'100%'} height={'100%'}/>
                        <p>{node.login}</p>
                    </div>)}
                    )}
                </div>
            </div>
        );
    }
}

