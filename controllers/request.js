import axios from 'axios';

export const getController = ({ url = 'index.php', params } = {}) => {
  return axios.get(url, { params });
};

export const postController = ({
  url = '/index.php',
  options,
  params = {}
} = {}) => {
  return axios.post(url, options, params);
};
