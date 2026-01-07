class PeerService {
    private peer: any;

    constructor() {
        if (!this.peer) {

            // ice (Interactive Connectivity Establishment) servers configuration
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478"
                        ]
                    }
                ]
            })
        }

    }

    async getAnswer(offer: RTCSessionDescriptionInit) {
        if (!this.peer) return null;
        await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(new RTCSessionDescription(answer));
        return answer;
    }


    async getOffer() {
        if (!this.peer) return null;
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
    }

    async setLocalDescription(desc: RTCSessionDescriptionInit) {
        if (!this.peer) return;
        await this.peer.setRemoteDescription(new RTCSessionDescription(desc));
    }
}

export default new PeerService();