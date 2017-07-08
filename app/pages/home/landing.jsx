import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
const Logo = require('../../../static/icons/x-logo.png');
const Decorations = require('../../../static/icons/landing-decorations.svg');
// import { devices } from '../../styles';

const Wrapper = styled.div`
    background: ${props => props.theme.secondary};
    top: 80px;
    left: 0;
    right: 0;
    
    padding: 0;
    height: calc(100vh - 80px);
`;

const DecorationWrapper = styled.div`
    position: absolute;
    background: url(${Decorations});
    background-position: center 100%;
    background-repeat: no-repeat;
    top: 80px;
    width: 100vw;
    zIndex: 2;
    height: 100vh;
    padding: 0;
`;

const Container = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 80%;
    width: calc(100% - 60px);
    maxWidth: 1200px;
    margin: 0 auto;
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
`;

const LogoImage = styled.img`
    height: auto;
    width: auto;
    max-height: 50%;
    max-width: 90%;
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
