import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    overflow-y: auto;
    width: 300px;
    height: 100%;
    background-color: #E6E6E6;

    &::-webkit-scrollbar {
        width: 8px;
        background-color: inherit;
        padding-right: 1px;
    }

    &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
        background-color: #FEC111;
    }
`;

class ChatSidebar extends React.Component {
    render() {
        return (
            <Wrapper>
                <div style={{ height: '101%' }} />
            </Wrapper>
        );
    }
}

export default ChatSidebar;
