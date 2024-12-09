import chai from 'chai';
import api from '../server';
import supertest from 'supertest';

global.assert = chai.assert;
global.app = api;
global.request = supertest(api);
global.expect = chai.expect;

