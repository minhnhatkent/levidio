var ctct=window.ctct||{};ctct.optimizely=(function initOptimizelyModule(){"use strict";function _setCustomTag(key,value){var customTags={"campaign code":"Campaign Code (CC)","partner name":"Partner Name (PN)","relationship marketing code":"Relationship Marketing Code (RMC)"};if(typeof value==="string"){window.optimizely=window.optimizely||[];window.optimizely.push(["customTag",key,value]);}else{throw new Error(customTags[key]+" must be a string");}}
function _setCampaignCode(campaign_code){_setCustomTag("campaign code",campaign_code);}
function _setPartnerName(partner_name){_setCustomTag("partner name",partner_name);}
function _setRelationshipMarketingCode(relationship_marketing_code){_setCustomTag("relationship marketing code",relationship_marketing_code);}
function _setTestLane(){var TEST_LANE_DAYS=3650;if(ctct.cookies&&ctct.cookies.get({"name":"test_lane"})===null){ctct.cookies.add({"name":"test_lane","value":_getRandomNumber(1,100).toString(10),"domain":location.hostname.substring(location.hostname.indexOf(".")),"path":"/","expires":TEST_LANE_DAYS});}
function _getRandomNumber(min,max){return Math.floor(Math.random()*(max-min+1))+min;}}
function _optOut(){window.optimizely=window.optimizely||[];window.optimizely.push(["optOut"]);}
function _disableOptimizely(){window.optimizely=window.optimizely||[];window.optimizely.push(["disable"]);window.console.info("WARNING: All Optimizely functionality has been disabled. You may re-enable via ?d&optimizely_disable=false");}
function _getQueryParameters(queryString){var object={};object=queryString.substr(1).split("&").map(function getKeyValuePair(item){return item=item.split("="),object[item[0]]=item[1],object;})[0];return object;}
function _getOptimizelyConfig(options,hostname,queryString){var config={"optOut":false,"disable":false,"customTags":{}},optOut=_getQueryParameters(queryString).optimizely_optOut,disable=_getQueryParameters(queryString).optimizely_disable;if(optOut!==undefined){config.optOut=(optOut.toLowerCase()==="true");}
if(disable!==undefined){config.disable=(disable.toLowerCase()==="true");}
for(var property in options){if(options.hasOwnProperty(property)){config[property]=options[property];}}
return config;}
function _initOptimizely(options,hostname,queryString){options=(options!==undefined?options:"");hostname=(hostname!==undefined?hostname:window.location.hostname);queryString=(queryString!==undefined?queryString:window.location.search);var config=_getOptimizelyConfig(options,hostname,queryString);ctct.optimizely.setTestLane();_makeOptimizelyAPICalls(config);function _makeOptimizelyAPICalls(config){if(config.optOut){_optOut();}
if(config.disable){_disableOptimizely();}
for(var tag in config.customTags){if(config.customTags.hasOwnProperty(tag)){_setCustomTag(tag,config.customTags[tag]);}}}}
return{"init":_initOptimizely,"setPartnerName":_setPartnerName,"setCampaignCode":_setCampaignCode,"setRelationshipMarketingCode":_setRelationshipMarketingCode,"setTestLane":_setTestLane};}());