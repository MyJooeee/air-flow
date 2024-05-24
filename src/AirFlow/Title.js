import PropTypes from 'prop-types';
import { Skeleton, Typography } from '@mui/material';

// ---------------------------------------------------------------------------------

const Title = ({ loading, name }) => {
  if (loading) return <Skeleton width={150} height={80} />;
    const title = "Air quality in";
    return <Typography variant='h4'> {title} {name} </Typography>;
  };

  Title.propTypes = {
    loading: PropTypes.bool,
    name: PropTypes.string
  };

export default Title;