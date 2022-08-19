declare module 'kill-port' {
  declare function kill(port: number, type: 'tcp' | 'udp'): Promise<void>
  export default kill
}
