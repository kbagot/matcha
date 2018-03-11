import React from 'react';

export default class DisplayUsers extends React.Component {
    constructor(props) {
        super(props)

    }

    displayres() {
        return(
            this.props.result.map((node, key) => { //TODO CREATE COMPONENT
                if (!this.props.user.block || !this.props.user.block.includes(node.id)) {
                    let img = node.img;
                    let like = '';
                    let online = '';
                    let usersexe = 'resUserInfo';

                    if (!img)
                        img = '../../img/nopic.png';

                    if (this.props.allUsers.findIndex(elem => elem.id === node.id) !== -1)
                        online = {color: 'lawngreen'};
                    else
                        online = {color: 'white'};
                    // const self = this.props.user.id === node.id;

                    if (this.props.user)
                        if (this.props.user.match && this.props.user.match.findIndex(elem => elem.id === node.id) !== -1) {
                            like = "../../img/fullheart.png";
                        } else if (node.user1) {
                            like = "../../img/halfheart.png";
                        } else {
                            like = "";
                        }
                    if (node.sexe === 'M')
                        usersexe += ' resUsermen';
                    else if (node.sexe === 'F')
                        usersexe += ' resUsergirl';
                    return (
                        <div key={key} className="resUser" onClick={(ev) => this.props.handleClick(ev, node)}>
                            <img src={img} width={'100%'} height={'100%'}/>
                            <div className={usersexe}>
                                <img className='like' src={like}/>
                                <p style={online}>{node.login}</p>
                            </div>
                        </div>
                    )
                }
            })
        )
    }

    render () {
        return (
            <div className="resList">
                {this.displayres()}
            </div>
        )
    }
}