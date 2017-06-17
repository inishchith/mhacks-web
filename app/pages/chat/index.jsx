import React from 'react';
import styled from 'styled-components';

import Sidebar from './sidebar';
import ChatDisplay from './chat_display';

const Wrapper = styled.div`
    position: absolute;
    display: flex;
    background: #F3F3F3;
    width: ${props => props.width}px;
    height: ${props => props.height}px;
`;

class ChatPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { width: '0', height: '0' };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    render() {
        return (
            <Wrapper {...this.state}>
                <Sidebar />
                <ChatDisplay />
            </Wrapper>
        );
    }
}

export default ChatPage;
