import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';

const Title = ({ loading, name }) => {
    const title = "Air quality in";
    if (loading) return `${title} loading...`;
    return <Typography variant='h4'> {title} {name} </Typography>;
  };

  Title.propTypes = {
    loading: PropTypes.bool,
    name: PropTypes.string
  };

export default Title;