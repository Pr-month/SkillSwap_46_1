const IP_SEPARATOR = ',';

export const transformStringIPsToArr = (stringIPs: string) =>
  stringIPs.split(IP_SEPARATOR);
