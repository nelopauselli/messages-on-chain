class PlainEncoder {
    encode(content){
        return Buffer.from(content, 'utf8');
    }
    decode(content){
        return Buffer.from(content).toString('utf8');
    }
}

module.exports = PlainEncoder;