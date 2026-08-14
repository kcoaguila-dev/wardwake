import { WebAudioSynthService } from '../../../../src/features/combat/infrastructure/WebAudioSynthService';

describe('WebAudioSynthService', () => {
  let mockAudioContext: any;
  let service: WebAudioSynthService;

  beforeEach(() => {
    // Mock the Web Audio API in Node/browser environment
    mockAudioContext = {
      state: 'running',
      resume: jest.fn().mockResolvedValue(undefined),
      currentTime: 0,
      createGain: jest.fn().mockReturnValue({
        connect: jest.fn(),
        gain: {
          value: 0,
          setValueAtTime: jest.fn(),
          linearRampToValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
      }),
      createOscillator: jest.fn().mockReturnValue({
        type: 'sine',
        frequency: {
          setValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      }),
      createBuffer: jest.fn().mockReturnValue({
        getChannelData: jest.fn().mockReturnValue(new Float32Array(44100)),
      }),
      createBufferSource: jest.fn().mockReturnValue({
        buffer: null,
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      }),
      sampleRate: 44100,
      destination: {},
    };

    (global as any).window = (global as any).window || {};
    (global as any).window.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
    (global as any).AudioContext = (global as any).window.AudioContext;

    service = new WebAudioSynthService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize correctly with AudioContext', () => {
    expect(service.isMuted).toBe(false);
    expect((global as any).window.AudioContext).toHaveBeenCalled();
  });

  it('should toggle mute state correctly', () => {
    expect(service.isMuted).toBe(false);
    service.toggleMute();
    expect(service.isMuted).toBe(true);
    service.toggleMute();
    expect(service.isMuted).toBe(false);
  });

  it('should not play sound if muted', () => {
    service.toggleMute();
    service.playSound('sword_slash');
    expect(mockAudioContext.createGain).not.toHaveBeenCalled();
  });

  it('should resume AudioContext if suspended', () => {
    mockAudioContext.state = 'suspended';
    service.playSound('sword_slash');
    expect(mockAudioContext.resume).toHaveBeenCalled();
  });

  it('should play sword_slash sound correctly', () => {
    service.playSound('sword_slash');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
  });

  it('should play axe_smash sound correctly', () => {
    service.playSound('axe_smash');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
  });

  it('should play lance_pierce sound correctly', () => {
    service.playSound('lance_pierce');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it('should play hero_step sound correctly', () => {
    service.playSound('hero_step');
    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
  });

  it('should play item_pickup sound correctly', () => {
    service.playSound('item_pickup');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it('should play staircase_descend sound correctly', () => {
    service.playSound('staircase_descend');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });
});
