 !function(e,o,n){window.HSCW=o,window.HS=n,n.beacon=n.beacon||{};var t=n.beacon;t.userConfig={},t.readyQueue=[],t.config=function(e){this.userConfig=e},t.ready=function(e){this.readyQueue.push(e)},o.config={docs:{enabled:!1,baseUrl:""},contact:{enabled:!0,formId:"e389010d-5614-11e8-8d65-0ee9bb0328ce"}};var r=e.getElementsByTagName("script")[0],c=e.createElement("script");c.type="text/javascript",c.async=!0,c.src="https://djtflbt20bdde.cloudfront.net/",r.parentNode.insertBefore(c,r)}(document,window.HSCW||{},window.HS||{});


 HS.beacon.config({
    modal:true,
    poweredBy:false,
    showSubject:true,
    showName:true,

    topics: [
      { val: 'general',label:'General question'},
      { val: 'tech', label: 'Technical question/issue' },
      { val:'enterprise',label:'Enterprise Integration'},
      { val: 'other',label:'other'}
    ],
    attachment: true,
    instructions:'Use this form or email us directly at contact@chainstamp.io'
  });

  function openBeacon() {
    HS.beacon.open();
  }