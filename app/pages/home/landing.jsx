import React from 'react';
import styled from 'styled-components';
import { devices } from '../../styles';
import { connect } from 'react-redux';
const Logo = require('../../../static/icons/x-logo.png');
const Decorations = require('../../../static/icons/landing-decorations.svg');
// import { devices } from '../../styles';

const Wrapper = styled.div`
    background: ${props => props.theme.secondary};
    left: 0;
    right: 0;
    
    padding: 0;
    height: 75vh;
`;

const DecorationWrapper = styled.div`
    position: absolute;
    background: url(${Decorations});
    background-repeat: no-repeat;
    top: 0px;
    left: 0px;
    right: 0px;
    zIndex: 2;
    width: 100%;
    height: 1000px;
    padding: 0;
`;

const Container = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    top: -25%;
    height: 1000px;
    maxWidth: 1200px;
    margin: 0 auto;
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    
    ${devices.tablet`
        width: calc(100% - 100px);
    `}
    ${devices.desktop`
        width: calc(100% - 140px);
    `}
    ${devices.giant`
        width: calc(100% - 160px);
    `}
`;

const LogoImage = styled.img`
    height: auto;
    width: 200px;
    marginLeft: auto;
    marginRight: auto;

`;


class Landing extends React.Component {
    render() {
        return (
            <Wrapper>
                <DecorationWrapper />
                <Container>
                    <LogoImage src={Logo} />

                </Container>
            </Wrapper>
        );
    }
}

function mapStateToProps(state) {
    return {
        theme: state.theme.data
    };
}

export default connect(mapStateToProps)(Landing);
